import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { PostViewClient } from './PostViewClient';
import type { PostWithComments } from '@/types';

interface PostPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PostPageProps) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    select: { title: true, content: true },
  });

  if (!post) return { title: 'Not found' };

  return {
    title: `${post.title} — HardHeartHeard`,
    description: post.content.slice(0, 160),
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const supabase = createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true,
          is_banned: true,
        },
      },
      comments: {
        where: { is_deleted: false },
        orderBy: { created_at: 'asc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              display_name: true,
              avatar_url: true,
              is_banned: true,
            },
          },
        },
      },
    },
  });

  if (!post) notFound();

  let currentUser = null;
  let hasCommented = false;

  if (supabaseUser?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
      select: { id: true, username: true, coins: true, is_banned: true, is_admin: true },
    });

    if (dbUser) {
      currentUser = dbUser;

      // Check if user already commented on this post
      const existing = await prisma.comment.findFirst({
        where: {
          post_id: post.id,
          author_id: dbUser.id,
          is_deleted: false,
        },
      });
      hasCommented = !!existing;
    }
  }

  return (
    <PostViewClient
      post={post as unknown as PostWithComments}
      currentUser={currentUser}
      hasCommented={hasCommented}
    />
  );
}
