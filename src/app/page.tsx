import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { PostCard } from '@/components/PostCard';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Flame, Clock, PenLine } from 'lucide-react';
import type { FeedPost } from '@/types';

type SortMode = 'recent' | 'trending';

interface FeedPageProps {
  searchParams: { sort?: string };
}

async function getPosts(sort: SortMode): Promise<FeedPost[]> {
  const posts = await prisma.post.findMany({
    where: { is_deleted: false },
    orderBy:
      sort === 'trending'
        ? [{ comments: { _count: 'desc' } }, { created_at: 'desc' }]
        : { created_at: 'desc' },
    take: 50,
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
      _count: { select: { comments: { where: { is_deleted: false } } } },
    },
  });

  return posts as unknown as FeedPost[];
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const sort: SortMode = searchParams.sort === 'trending' ? 'trending' : 'recent';
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const posts = await getPosts(sort);

  const stats = await prisma.$transaction([
    prisma.user.count({ where: { is_banned: false } }),
    prisma.post.count({ where: { is_deleted: false } }),
    prisma.user.aggregate({ _sum: { coins: true } }),
  ]);

  const [userCount, postCount, coinAgg] = stats;
  const totalCoins = coinAgg._sum.coins ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero header */}
      <div className="mb-10 text-center">
        <div className="inline-block mb-4">
          <span className="text-xs font-sans uppercase tracking-[0.3em] text-blood border border-blood/30 px-3 py-1 rounded-sm">
            Dystopian Poetry Exchange
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-cream mb-3 leading-tight">
          Every word costs.<br />
          <span className="text-blood">Every silence kills.</span>
        </h1>
        <p className="font-serif text-cream-muted text-lg max-w-lg mx-auto italic">
          Attention is currency in this dying world. Spend wisely.
        </p>

        {/* Economy stats */}
        <div className="mt-6 inline-flex items-center gap-6 text-xs text-cream-faint border border-cream/10 rounded-sm px-5 py-2.5 bg-ink-50">
          <span>
            <span className="text-gold font-semibold">{totalCoins.toLocaleString()}</span> coins in circulation
          </span>
          <span className="text-cream/20">|</span>
          <span>
            <span className="text-cream font-semibold">{userCount.toLocaleString()}</span> souls
          </span>
          <span className="text-cream/20">|</span>
          <span>
            <span className="text-cream font-semibold">{postCount.toLocaleString()}</span> confessions
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1">
          <Link href="/?sort=recent">
            <Button
              variant={sort === 'recent' ? 'outline' : 'ghost'}
              size="sm"
              className={`gap-1.5 ${sort === 'recent' ? 'border-cream/30 text-cream' : 'text-cream-faint'}`}
            >
              <Clock className="h-3.5 w-3.5" />
              Recent
            </Button>
          </Link>
          <Link href="/?sort=trending">
            <Button
              variant={sort === 'trending' ? 'outline' : 'ghost'}
              size="sm"
              className={`gap-1.5 ${sort === 'trending' ? 'border-cream/30 text-cream' : 'text-cream-faint'}`}
            >
              <Flame className="h-3.5 w-3.5" />
              Trending
            </Button>
          </Link>
        </div>

        {user && (
          <Link href="/write">
            <Button size="sm" className="gap-1.5">
              <PenLine className="h-3.5 w-3.5" />
              Write
            </Button>
          </Link>
        )}
      </div>

      {/* Posts feed */}
      {posts.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-display text-2xl text-cream-faint mb-2">The void is silent.</p>
          <p className="font-serif text-cream-faint/60 text-sm italic">
            Be the first to break the silence.
          </p>
          {user && (
            <Link href="/write" className="mt-6 inline-block">
              <Button className="gap-1.5">
                <PenLine className="h-4 w-4" />
                Write the first poem
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Unauthenticated CTA */}
      {!user && posts.length > 0 && (
        <div className="mt-12 text-center p-8 border border-blood/20 rounded-lg bg-blood/5">
          <p className="font-display text-xl text-cream mb-2">You are a ghost here.</p>
          <p className="font-serif text-cream-muted text-sm italic mb-4">
            Sign in to spend your 10,000 starting coins and make yourself heard.
          </p>
          <p className="text-xs text-cream-faint">
            Maximum 144,000 souls. 1,440,000,000 coins total in this economy.
          </p>
        </div>
      )}
    </div>
  );
}
