import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { ADMIN_EMAIL } from '@/lib/admin';
import { triggerBan, addCoins } from '@/lib/coins';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser?.email || supabaseUser.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, ...payload } = body;

    switch (action) {
      case 'ban_user': {
        const { user_id, reason } = payload;
        if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

        await triggerBan(user_id, reason || 'Admin ban');
        return NextResponse.json({ success: true, message: `User banned.` });
      }

      case 'unban_user': {
        const { user_id } = payload;
        if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

        await prisma.user.update({
          where: { id: user_id },
          data: { is_banned: false, ban_reason: null, banned_at: null },
        });
        await prisma.hallOfShame.deleteMany({ where: { user_id } });
        return NextResponse.json({ success: true, message: 'User unbanned.' });
      }

      case 'grant_coins': {
        const { username, amount } = payload;
        if (!username) return NextResponse.json({ error: 'username required' }, { status: 400 });

        const amountNum = parseInt(amount, 10);
        if (isNaN(amountNum) || amountNum <= 0) {
          return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        await addCoins(user.id, null, amountNum, 'ADMIN_GRANT');
        return NextResponse.json({ success: true, message: `Granted ${amountNum} coins to @${username}.` });
      }

      case 'take_coins': {
        const { username, amount } = payload;
        if (!username) return NextResponse.json({ error: 'username required' }, { status: 400 });

        const amountNum = parseInt(amount, 10);
        if (isNaN(amountNum) || amountNum <= 0) {
          return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
          where: { username },
          select: { id: true, coins: true },
        });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const actualDeduct = Math.min(amountNum, user.coins);
        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { coins: { decrement: actualDeduct } },
          }),
          prisma.coinTransaction.create({
            data: {
              from_user_id: user.id,
              amount: actualDeduct,
              type: 'ADMIN_TAKE',
            },
          }),
        ]);

        // Check if user is now bankrupt
        const updated = await prisma.user.findUnique({ where: { id: user.id }, select: { coins: true } });
        if (updated && updated.coins <= 0) {
          await triggerBan(user.id, 'Coins taken by admin — balance reached zero');
        }

        return NextResponse.json({ success: true, message: `Took ${actualDeduct} coins from @${username}.` });
      }

      case 'delete_post': {
        const { post_id } = payload;
        if (!post_id) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

        await prisma.post.update({ where: { id: post_id }, data: { is_deleted: true } });
        return NextResponse.json({ success: true, message: 'Post deleted.' });
      }

      case 'delete_comment': {
        const { comment_id } = payload;
        if (!comment_id) return NextResponse.json({ error: 'comment_id required' }, { status: 400 });

        await prisma.comment.update({ where: { id: comment_id }, data: { is_deleted: true } });
        return NextResponse.json({ success: true, message: 'Comment deleted.' });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    console.error('[POST /api/admin]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
