import prisma from '@/lib/prisma';

export interface FingerprintData {
  hash: string;
  ipAddress: string;
  userAgent: string;
  userId?: string;
}

/**
 * Log a fingerprint visit to the database.
 */
export async function logFingerprint(data: FingerprintData): Promise<void> {
  await prisma.fingerprintLog.create({
    data: {
      fingerprint_hash: data.hash,
      user_id: data.userId ?? null,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
    },
  });
}

/**
 * Update the user's fingerprint hash and IP history.
 */
export async function updateUserFingerprint(
  userId: string,
  fingerprintHash: string,
  ipAddress: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ip_history: true },
  });

  if (!user) return;

  const ipHistory = user.ip_history ?? [];
  const updatedIpHistory = ipHistory.includes(ipAddress)
    ? ipHistory
    : [...ipHistory, ipAddress].slice(-50); // Keep last 50 IPs

  await prisma.user.update({
    where: { id: userId },
    data: {
      fingerprint_hash: fingerprintHash,
      ip_history: updatedIpHistory,
    },
  });
}

/**
 * Check if a fingerprint is associated with any banned users
 * (multi-account detection).
 */
export async function checkFingerprintBanned(fingerprintHash: string): Promise<boolean> {
  const bannedUser = await prisma.user.findFirst({
    where: {
      fingerprint_hash: fingerprintHash,
      is_banned: true,
    },
  });

  return !!bannedUser;
}

/**
 * Get all users sharing the same fingerprint.
 */
export async function getUsersByFingerprint(fingerprintHash: string) {
  return prisma.user.findMany({
    where: { fingerprint_hash: fingerprintHash },
    select: {
      id: true,
      username: true,
      display_name: true,
      email: true,
      is_banned: true,
      coins: true,
      created_at: true,
    },
  });
}
