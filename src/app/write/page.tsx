import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { WritePageClient } from './WritePageClient';

export const metadata = {
  title: 'Write — HardHeartHeard',
  description: 'Publish a new poem or confession. Costs 10 coins.',
};

export default async function WritePage() {
  const supabase = createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    redirect('/');
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: supabaseUser.email! },
    select: { id: true, username: true, coins: true, is_banned: true },
  });

  if (!dbUser) redirect('/');
  if (dbUser.is_banned) redirect('/hall-of-shame');

  return <WritePageClient userCoins={dbUser.coins} username={dbUser.username} />;
}
