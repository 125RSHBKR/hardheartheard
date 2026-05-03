import prisma from "@/lib/prisma";
import { TransactionType, Prisma } from ".prisma/client";

export const COIN_COSTS = {
  /** Cost per character when publishing a post (1 coin / char) */
  POST_PER_CHAR: 1,
  /** Coins earned by post author per character in a comment (0.5 coins / char) */
  COMMENT_EARN_PER_CHAR: 0.5,
} as const;

/** How many coins a post of charCount characters costs */
export function postCost(charCount: number): number {
  return Math.ceil(charCount * COIN_COSTS.POST_PER_CHAR);
}

/** How many coins a commenter pays (author receives) for a comment */
export function commentCost(charCount: number): number {
  return Math.ceil(charCount * COIN_COSTS.COMMENT_EARN_PER_CHAR);
}

export const SPAM_FLAG_THRESHOLD = 5;
export const SPAM_PUNISHMENT_AMOUNT = 20;

/**
 * Deduct coins from a user and record the transaction.
 * Returns the updated coin balance.
 */
export async function deductCoins(
  userId: string,
  amount: number,
  type: TransactionType,
  referenceId?: string,
): Promise<{ success: boolean; newBalance: number; banned: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, coins: true, is_banned: true },
  });

  if (!user) throw new Error("User not found");
  if (user.is_banned) return { success: false, newBalance: 0, banned: true };

  const newBalance = user.coins - amount;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.user.update({
      where: { id: userId },
      data: { coins: { decrement: amount } },
    });

    await tx.coinTransaction.create({
      data: {
        from_user_id: userId,
        amount,
        type,
        reference_id: referenceId ?? null,
      },
    });
  });

  // Check for ban condition
  if (newBalance <= 0) {
    await triggerBan(userId, "Coin balance reached zero");
    return { success: true, newBalance: 0, banned: true };
  }

  return { success: true, newBalance, banned: false };
}

/**
 * Add coins to a user's balance.
 */
export async function addCoins(
  toUserId: string,
  fromUserId: string | null,
  amount: number,
  type: TransactionType,
  referenceId?: string,
): Promise<number> {
  const updated = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.update({
        where: { id: toUserId },
        data: { coins: { increment: amount } },
        select: { coins: true },
      });

      await tx.coinTransaction.create({
        data: {
          from_user_id: fromUserId,
          to_user_id: toUserId,
          amount,
          type,
          reference_id: referenceId ?? null,
        },
      });

      return user;
    },
  );

  return updated.coins;
}

/**
 * Transfer coins from one user to another (DM transfer).
 */
export async function transferCoins(
  fromUserId: string,
  toUserId: string,
  amount: number,
): Promise<{ success: boolean; error?: string }> {
  const sender = await prisma.user.findUnique({
    where: { id: fromUserId },
    select: { coins: true, is_banned: true },
  });

  if (!sender) return { success: false, error: "Sender not found" };
  if (sender.is_banned)
    return { success: false, error: "Your account is banned" };
  if (sender.coins < amount)
    return { success: false, error: "Insufficient coins" };
  if (amount <= 0) return { success: false, error: "Amount must be positive" };

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.user.update({
      where: { id: fromUserId },
      data: { coins: { decrement: amount } },
    });

    await tx.user.update({
      where: { id: toUserId },
      data: { coins: { increment: amount } },
    });

    await tx.coinTransaction.create({
      data: {
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount,
        type: "TRANSFER",
      },
    });
  });

  // Check if sender is now bankrupt
  const updatedSender = await prisma.user.findUnique({
    where: { id: fromUserId },
    select: { coins: true },
  });

  if (updatedSender && updatedSender.coins <= 0) {
    await triggerBan(fromUserId, "Coin balance reached zero after transfer");
  }

  return { success: true };
}

/**
 * Tip a comment author.
 */
export async function tipComment(
  tipperId: string,
  commentId: string,
  amount: number,
): Promise<{ success: boolean; error?: string }> {
  const tipper = await prisma.user.findUnique({
    where: { id: tipperId },
    select: { coins: true, is_banned: true },
  });

  if (!tipper) return { success: false, error: "User not found" };
  if (tipper.is_banned)
    return { success: false, error: "Your account is banned" };
  if (tipper.coins < amount)
    return { success: false, error: "Insufficient coins" };
  if (amount <= 0) return { success: false, error: "Amount must be positive" };

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { author_id: true, is_deleted: true },
  });

  if (!comment || comment.is_deleted)
    return { success: false, error: "Comment not found" };
  if (comment.author_id === tipperId)
    return { success: false, error: "Cannot tip your own comment" };

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.user.update({
      where: { id: tipperId },
      data: { coins: { decrement: amount } },
    });

    await tx.user.update({
      where: { id: comment.author_id },
      data: { coins: { increment: amount } },
    });

    await tx.comment.update({
      where: { id: commentId },
      data: { coins_received: { increment: amount } },
    });

    await tx.coinTransaction.create({
      data: {
        from_user_id: tipperId,
        to_user_id: comment.author_id,
        amount,
        type: "TIP",
        reference_id: commentId,
      },
    });
  });

  // Check bankruptcy
  const updated = await prisma.user.findUnique({
    where: { id: tipperId },
    select: { coins: true },
  });
  if (updated && updated.coins <= 0) {
    await triggerBan(tipperId, "Coin balance reached zero after tipping");
  }

  return { success: true };
}

/**
 * Flag a comment as spam. If threshold reached, punish the spammer.
 */
export async function flagSpam(
  flaggerId: string,
  commentId: string,
): Promise<{ success: boolean; punished: boolean; error?: string }> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      author_id: true,
      spam_flag_count: true,
      is_spam_flagged: true,
      is_deleted: true,
    },
  });

  if (!comment || comment.is_deleted)
    return { success: false, punished: false, error: "Comment not found" };
  if (comment.author_id === flaggerId)
    return {
      success: false,
      punished: false,
      error: "Cannot flag your own comment",
    };

  const newFlagCount = comment.spam_flag_count + 1;
  const shouldPunish =
    newFlagCount >= SPAM_FLAG_THRESHOLD && !comment.is_spam_flagged;

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      spam_flag_count: newFlagCount,
      is_spam_flagged: shouldPunish ? true : comment.is_spam_flagged,
    },
  });

  if (shouldPunish) {
    // Punish the spammer
    const spammer = await prisma.user.findUnique({
      where: { id: comment.author_id },
      select: { coins: true },
    });

    if (spammer) {
      const punishAmount = Math.min(SPAM_PUNISHMENT_AMOUNT, spammer.coins);
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.user.update({
          where: { id: comment.author_id },
          data: { coins: { decrement: punishAmount } },
        });

        await tx.comment.update({
          where: { id: commentId },
          data: { coins_lost: { increment: punishAmount } },
        });

        await tx.coinTransaction.create({
          data: {
            from_user_id: comment.author_id,
            amount: punishAmount,
            type: "PUNISHMENT",
            reference_id: commentId,
          },
        });
      });

      // Check if spammer is now bankrupt
      const updatedSpammer = await prisma.user.findUnique({
        where: { id: comment.author_id },
        select: { coins: true },
      });
      if (updatedSpammer && updatedSpammer.coins <= 0) {
        await triggerBan(
          comment.author_id,
          "Banned for spam — coin balance reached zero",
        );
      }
    }

    return { success: true, punished: true };
  }

  return { success: true, punished: false };
}

/**
 * Ban a user and add them to the Hall of Shame.
 */
export async function triggerBan(
  userId: string,
  reason: string,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      display_name: true,
      coins: true,
      is_banned: true,
      is_admin: true,
    },
  });

  if (!user || user.is_banned || user.is_admin) return;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        is_banned: true,
        ban_reason: reason,
        banned_at: new Date(),
        coins: 0,
      },
    });

    // Upsert Hall of Shame entry
    await tx.hallOfShame.upsert({
      where: { user_id: userId },
      update: {},
      create: {
        user_id: userId,
        username: user.username,
        display_name: user.display_name,
        banned_at: new Date(),
        reason,
        final_coin_balance: user.coins,
      },
    });
  });
}

/**
 * Check if a user can afford an action.
 */
export function canAfford(userCoins: number, cost: number): boolean {
  return userCoins >= cost;
}
