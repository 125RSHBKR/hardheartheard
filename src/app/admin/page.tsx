import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { ADMIN_EMAIL } from '@/lib/admin';
import { AdminPageClient } from './AdminPageClient';

export const metadata = {
  title: 'Admin Panel — HardHeartHeard',
};

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser?.email || supabaseUser.email !== ADMIN_EMAIL) {
    redirect('/');
  }

  const [
    totalUsers,
    totalBanned,
    totalPosts,
    totalComments,
    coinAgg,
    users,
    recentPosts,
    recentTransactions,
    fingerprintLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { is_banned: true } }),
    prisma.post.count({ where: { is_deleted: false } }),
    prisma.comment.count({ where: { is_deleted: false } }),
    prisma.user.aggregate({ _sum: { coins: true } }),
    prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      take: 100,
      select: {
        id: true,
        username: true,
        display_name: true,
        email: true,
        coins: true,
        is_banned: true,
        is_admin: true,
        created_at: true,
        fingerprint_hash: true,
        ip_history: true,
        _count: { select: { posts: true, comments: true } },
      },
    }),
    prisma.post.findMany({
      orderBy: { created_at: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        is_deleted: true,
        created_at: true,
        author: { select: { username: true, display_name: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.coinTransaction.findMany({
      orderBy: { created_at: 'desc' },
      take: 100,
      select: {
        id: true,
        amount: true,
        type: true,
        created_at: true,
        from_user: { select: { username: true } },
        to_user: { select: { username: true } },
      },
    }),
    prisma.fingerprintLog.findMany({
      orderBy: { created_at: 'desc' },
      take: 100,
      select: {
        id: true,
        fingerprint_hash: true,
        ip_address: true,
        user_agent: true,
        created_at: true,
        user: { select: { username: true } },
      },
    }),
  ]);

  const data = {
    stats: {
      totalUsers,
      totalBanned,
      totalPosts,
      totalComments,
      totalCoinsInCirculation: coinAgg._sum.coins ?? 0,
    },
    users,
    recentPosts,
    recentTransactions,
    fingerprintLogs,
  };

  return <AdminPageClient data={data as any} />;
}
