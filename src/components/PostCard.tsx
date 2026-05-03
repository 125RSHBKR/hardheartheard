import React from 'react';
import Link from 'next/link';
import { MessageSquare, Coins, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeedPost } from '@/types';

interface PostCardProps {
  post: FeedPost;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PostCard({ post }: PostCardProps) {
  const isDeceasedAuthor = post.author.is_banned;
  const isDeleted = post.is_deleted;

  return (
    <article
      className={cn(
        'group relative border border-cream/10 bg-ink-50 rounded-lg overflow-hidden',
        'hover:border-cream/20 transition-all duration-300',
        'animate-fade-in',
        (isDeceasedAuthor || isDeleted) && 'opacity-60'
      )}
    >
      {/* DECEASED watermark */}
      {isDeceasedAuthor && !isDeleted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 rotate-[-15deg]">
          <span className="text-blood/30 font-display font-black text-5xl tracking-[0.3em] select-none border-4 border-blood/20 px-4 py-1">
            DECEASED
          </span>
        </div>
      )}

      <Link href={`/post/${post.id}`} className="block p-6">
        {/* Author info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-full bg-ink border border-cream/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {post.author.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.author.avatar_url}
                alt={post.author.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-3.5 w-3.5 text-cream-faint" />
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/profile/${post.author.username}`}
              className={cn(
                'text-sm font-medium truncate hover:text-gold transition-colors',
                isDeceasedAuthor ? 'text-cream-faint line-through' : 'text-cream-muted'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {isDeceasedAuthor ? `[DECEASED] ${post.author.display_name}` : post.author.display_name}
            </Link>
            <span className="text-cream-faint text-xs flex-shrink-0">
              @{post.author.username}
            </span>
          </div>
          <span className="ml-auto text-cream-faint text-xs flex-shrink-0">
            {formatTimeAgo(post.created_at)}
          </span>
        </div>

        {/* Title */}
        <h2
          className={cn(
            'font-display text-xl font-semibold mb-3 leading-snug',
            isDeceasedAuthor ? 'text-cream-faint' : 'text-cream group-hover:text-gold transition-colors'
          )}
        >
          {post.title}
        </h2>

        {/* Content preview */}
        <p
          className={cn(
            'font-serif text-sm leading-relaxed line-clamp-3',
            isDeceasedAuthor ? 'text-cream-faint/60' : 'text-cream-muted'
          )}
        >
          {post.content}
        </p>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-cream/5 flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-cream-faint">
            <MessageSquare className="h-3.5 w-3.5" />
            {post._count.comments} {post._count.comments === 1 ? 'response' : 'responses'}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-cream-faint ml-auto">
            <Coins className="h-3.5 w-3.5 text-gold-faint" />
            <span className="text-gold-faint">{post.coin_cost} coins to publish</span>
          </span>
        </div>
      </Link>

      {/* Left accent border on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blood/0 group-hover:bg-blood/60 transition-all duration-300" />
    </article>
  );
}
