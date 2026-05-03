import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { DMPageClient } from './DMPageClient';

interface DMPageProps {
  params: { username: string };
}

export default async function DMPage({ params }: DMPageProps) {
  const supabase = createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) redirect('/');

  const [sender, recipient] = await Promise.all([
    prisma.user.findUnique({
      where: { email: supabaseUser.email! },
      select: { id: true, username: true, coins: true, is_banned: true },
    }),
    prisma.user.findUnique({
      where: { username: params.username },
      select: { id: true, username: true, display_name: true, avatar_url: true, is_banned: true },
    }),
  ]);

  if (!sender) redirect('/');
  if (sender.is_banned) redirect('/hall-of-shame');
  if (!recipient) notFound();
  if (recipient.is_banned) notFound();
  if (sender.id === recipient.id) redirect(`/profile/${sender.username}`);

  return (
    <DMPageClient
      recipient={recipient}
      sender={sender}
    />
  );
}
