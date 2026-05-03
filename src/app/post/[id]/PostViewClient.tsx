"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Coins,
  ThumbsUp,
  Flag,
  User,
  AlertCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommentForm } from "@/components/CommentForm";
import { CoinBalance } from "@/components/CoinBalance";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { PostWithComments, AppUser } from "@/types";

interface PostViewClientProps {
  post: PostWithComments;
  currentUser: Pick<
    AppUser,
    "id" | "username" | "coins" | "is_banned" | "is_admin"
  > | null;
  hasCommented: boolean;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PostViewClient({
  post,
  currentUser,
  hasCommented: initialHasCommented,
}: PostViewClientProps) {
  const [hasCommented, setHasCommented] = useState(initialHasCommented);
  const [userCoins, setUserCoins] = useState(currentUser?.coins ?? 0);
  const [tipAmounts, setTipAmounts] = useState<Record<string, string>>({});
  const [loadingTip, setLoadingTip] = useState<string | null>(null);
  const [loadingFlag, setLoadingFlag] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const isDeceasedAuthor = post.author.is_banned;
  const requiresComment =
    !!currentUser && !currentUser.is_banned && !hasCommented;

  const handleCommentSuccess = (newBalance: number) => {
    setHasCommented(true);
    setUserCoins(newBalance);
  };

  const handleTip = async (commentId: string) => {
    const amount = parseInt(tipAmounts[commentId] || "0", 10);
    if (!amount || amount <= 0) return;

    setLoadingTip(commentId);
    try {
      const res = await fetch("/api/coins/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: commentId, amount }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Tip failed",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: `Tipped ${amount} coins`,
          description: "Your appreciation has been noted.",
        });
        setUserCoins(data.newBalance);
        setTipAmounts((prev) => ({ ...prev, [commentId]: "" }));
        router.refresh();
      }
    } finally {
      setLoadingTip(null);
    }
  };

  const handleFlag = async (commentId: string) => {
    setLoadingFlag(commentId);
    try {
      const res = await fetch("/api/coins/punish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: commentId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Flag failed",
          description: data.error,
          variant: "destructive",
        });
      } else {
        if (data.punished) {
          toast({
            title: "Spam punished",
            description:
              "This comment has been flagged enough. The author has been penalized.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Flagged",
            description: "This comment has been flagged as spam.",
          });
        }
        router.refresh();
      }
    } finally {
      setLoadingFlag(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Require comment banner */}
      {requiresComment && (
        <div className="mb-6 p-4 bg-blood/10 border border-blood/40 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blood flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blood">
              You must respond before you leave.
            </p>
            <p className="text-xs text-cream-muted mt-1">
              Reading without responding is theft. Scroll down and leave your
              mark.
            </p>
          </div>
        </div>
      )}

      {/* Post header */}
      <article className="mb-12">
        {/* Author */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-ink-50 border border-cream/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {post.author.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.author.avatar_url}
                alt={post.author.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-cream-faint" />
            )}
          </div>
          <div>
            <Link
              href={`/profile/${post.author.username}`}
              className={cn(
                "font-medium hover:text-gold transition-colors",
                isDeceasedAuthor
                  ? "text-cream-faint line-through"
                  : "text-cream",
              )}
            >
              {isDeceasedAuthor
                ? `[DECEASED] ${post.author.display_name}`
                : post.author.display_name}
            </Link>
            <p className="text-xs text-cream-faint">
              @{post.author.username} · {formatDate(post.created_at)}
            </p>
          </div>
          {isDeceasedAuthor && (
            <span className="ml-auto text-xs font-sans text-blood border border-blood/40 px-2 py-0.5 rounded-sm tracking-widest uppercase">
              Deceased
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className={cn(
            "font-display text-3xl sm:text-4xl font-black leading-tight mb-8",
            isDeceasedAuthor ? "text-cream-faint" : "text-cream",
          )}
        >
          {post.title}
        </h1>

        {/* Content */}
        <div className={cn("relative", isDeceasedAuthor && "opacity-70")}>
          {isDeceasedAuthor && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 rotate-[-8deg]">
              <span className="text-blood/20 font-display font-black text-7xl tracking-[0.3em] select-none border-4 border-blood/10 px-6 py-2">
                DECEASED
              </span>
            </div>
          )}
          <div className="prose-poem blood-border text-base sm:text-lg leading-8">
            {post.content}
          </div>
        </div>
      </article>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 border-t border-cream/10" />
        <span className="text-xs text-cream-faint uppercase tracking-widest font-sans">
          {post.comments.filter((c) => !c.is_deleted).length} Responses
        </span>
        <div className="flex-1 border-t border-cream/10" />
      </div>

      {/* Comment form */}
      {currentUser && !currentUser.is_banned && (
        <div className="mb-10 p-5 border border-cream/10 rounded-lg bg-ink-50">
          <h3 className="text-xs uppercase tracking-widest text-cream-faint mb-4 font-sans">
            Leave your response
          </h3>
          <CommentForm
            postId={post.id}
            userCoins={userCoins}
            onSuccess={handleCommentSuccess}
            required={requiresComment}
          />
        </div>
      )}

      {!currentUser && (
        <div className="mb-10 p-5 border border-blood/20 rounded-lg bg-blood/5 text-center">
          <p className="font-serif text-cream-muted italic text-sm">
            Sign in to respond. Silence is not an option.
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {post.comments
          .filter((c) => !c.is_deleted)
          .map((comment) => (
            <div
              key={comment.id}
              className={cn(
                "p-5 border rounded-lg transition-all",
                comment.is_spam_flagged
                  ? "border-blood/30 bg-blood/5 opacity-60"
                  : "border-cream/10 bg-ink-50",
              )}
            >
              {/* Comment author */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-full bg-ink border border-cream/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {comment.author?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={comment.author.avatar_url}
                      alt={comment.author.display_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-3.5 w-3.5 text-cream-faint" />
                  )}
                </div>
                <Link
                  href={`/profile/${comment.author?.username}`}
                  className="text-sm font-medium text-cream-muted hover:text-gold transition-colors"
                >
                  {comment.author?.display_name}
                </Link>
                <span className="text-xs text-cream-faint">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
                {comment.is_spam_flagged && (
                  <span className="ml-auto text-xs text-blood border border-blood/30 px-1.5 py-0.5 rounded-sm">
                    SPAM
                  </span>
                )}
                {comment.coins_received > 0 && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-gold">
                    <Coins className="h-3 w-3" />+{comment.coins_received}
                  </span>
                )}
              </div>

              {/* Comment content */}
              <p className="font-serif text-sm text-cream-muted leading-relaxed">
                {comment.content}
              </p>

              {/* Actions */}
              {currentUser &&
                !currentUser.is_banned &&
                currentUser.id !== comment.author_id && (
                  <div className="mt-4 pt-3 border-t border-cream/5 flex items-center gap-3 flex-wrap">
                    {/* Tip */}
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        min="1"
                        max={userCoins}
                        placeholder="tip..."
                        value={tipAmounts[comment.id] || ""}
                        onChange={(e) =>
                          setTipAmounts((prev) => ({
                            ...prev,
                            [comment.id]: e.target.value,
                          }))
                        }
                        className="h-7 w-20 text-xs px-2"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTip(comment.id)}
                        disabled={
                          loadingTip === comment.id || !tipAmounts[comment.id]
                        }
                        className="h-7 px-2 text-xs text-gold hover:text-gold-light gap-1"
                      >
                        <ChevronUp className="h-3 w-3" />
                        Tip
                      </Button>
                    </div>

                    {/* Flag */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleFlag(comment.id)}
                      disabled={loadingFlag === comment.id}
                      className="h-7 px-2 text-xs text-cream-faint hover:text-blood gap-1 ml-auto"
                    >
                      <Flag className="h-3 w-3" />
                      Flag spam
                      {comment.spam_flag_count > 0 && (
                        <span className="text-blood/60">
                          ({comment.spam_flag_count})
                        </span>
                      )}
                    </Button>
                  </div>
                )}
            </div>
          ))}

        {post.comments.filter((c) => !c.is_deleted).length === 0 &&
          !currentUser && (
            <p className="text-center text-cream-faint font-serif italic py-8">
              No responses yet. The void awaits.
            </p>
          )}
      </div>
    </div>
  );
}
