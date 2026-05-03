"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CommentForm } from "@/components/CommentForm";
import { CoinBalance } from "@/components/CoinBalance";
import { useToast } from "@/components/ui/use-toast";
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
    router.refresh();
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
          title: "tip failed",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: `¢ ${amount} sent`,
          description: "transmission received.",
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
          title: "flag failed",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: data.punished ? "// SPAM PUNISHED" : "// flagged",
          description: data.punished
            ? "coins deducted from spammer."
            : "flag recorded.",
        });
        router.refresh();
      }
    } finally {
      setLoadingFlag(null);
    }
  };

  const visibleComments = post.comments.filter((c) => !c.is_deleted);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 font-mono">
      {/* Must-comment warning */}
      {requiresComment && (
        <div
          className="mb-6 p-4 border-red-glow flex items-start gap-3"
          style={{
            borderLeft: "3px solid #ff0000",
            paddingLeft: "1rem",
            background: "rgba(255,0,0,0.05)",
          }}
        >
          <span style={{ color: "#ff0000" }}>!</span>
          <div>
            <p
              className="text-sm font-bold"
              style={{ color: "#ff0000", textShadow: "0 0 8px #ff0000" }}
            >
              you must respond before you leave.
            </p>
            <p className="text-xs mt-1" style={{ color: "#003b0f" }}>
              reading without responding is theft. scroll down and leave your
              mark.
            </p>
          </div>
        </div>
      )}

      {/* Back link */}
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-widest mb-8 inline-block transition-all"
        style={{ color: "#003b0f" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = "#00f5ff";
          (e.currentTarget as HTMLAnchorElement).style.textShadow =
            "0 0 8px #00f5ff";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = "#003b0f";
          (e.currentTarget as HTMLAnchorElement).style.textShadow = "";
        }}
      >
        &lt; back to feed
      </Link>

      {/* Post */}
      <article className="mb-12">
        {/* Author */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 flex items-center justify-center font-mono text-sm flex-shrink-0"
            style={{
              border: "1px solid #003b0f",
              color: "#ff006e",
              textShadow: "0 0 6px rgba(255,0,110,0.4)",
            }}
          >
            {(post.author.display_name ||
              post.author.username ||
              "?")[0].toUpperCase()}
          </div>
          <div>
            <Link
              href={`/profile/${post.author.username}`}
              className="font-mono text-sm transition-all"
              style={{
                color: isDeceasedAuthor ? "#003b0f" : "#ff006e",
                textShadow: isDeceasedAuthor
                  ? ""
                  : "0 0 6px rgba(255,0,110,0.4)",
                textDecoration: isDeceasedAuthor ? "line-through" : "none",
              }}
            >
              {isDeceasedAuthor
                ? `[DECEASED] ${post.author.display_name}`
                : post.author.display_name}
            </Link>
            <p
              className="text-xs mt-0.5"
              style={{
                color: "#00f5ff",
                textShadow: "0 0 4px rgba(0,245,255,0.3)",
              }}
            >
              @{post.author.username} · {formatDate(post.created_at)}
            </p>
          </div>
          {isDeceasedAuthor && (
            <span
              className="ml-auto text-xs uppercase tracking-widest px-2 py-0.5"
              style={{
                color: "#ff0000",
                border: "1px solid #ff0000",
                textShadow: "0 0 8px #ff0000",
                boxShadow: "0 0 6px rgba(255,0,0,0.3)",
              }}
            >
              deceased
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-wide leading-tight mb-8"
          style={{
            color: isDeceasedAuthor ? "#003b0f" : "#00ff41",
            textShadow: isDeceasedAuthor
              ? ""
              : "0 0 8px #00ff41, 0 0 20px rgba(0,255,65,0.3)",
          }}
        >
          {post.title}
        </h1>

        {/* Content */}
        <div className="relative">
          {isDeceasedAuthor && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 rotate-[-8deg]">
              <span className="deceased-stamp">DECEASED</span>
            </div>
          )}
          <div
            className="prose-poem text-base sm:text-lg leading-8"
            style={{ borderLeft: "2px solid #003b0f", paddingLeft: "1rem" }}
          >
            {post.content}
          </div>
        </div>
      </article>

      {/* Divider */}
      <div className="vhs-line mb-2" />
      <div className="flex items-center justify-center mb-8">
        <span
          className="text-xs uppercase tracking-widest px-4"
          style={{ color: "#003b0f" }}
        >
          // {visibleComments.length} responses
        </span>
      </div>

      {/* Comment form */}
      {currentUser && !currentUser.is_banned && (
        <div className="mb-10 p-5" style={{ border: "1px solid #003b0f" }}>
          <h3
            className="text-xs uppercase tracking-widest mb-4"
            style={{
              color: "#00f5ff",
              textShadow: "0 0 6px rgba(0,245,255,0.4)",
            }}
          >
            &gt; leave your response
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
        <div
          className="mb-10 p-5 text-center"
          style={{
            border: "1px solid #ff006e",
            background: "rgba(255,0,110,0.04)",
          }}
        >
          <p
            className="font-mono text-sm"
            style={{
              color: "#ff006e",
              textShadow: "0 0 6px rgba(255,0,110,0.4)",
            }}
          >
            sign in to respond. silence is not an option.
          </p>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-4">
        {visibleComments.map((comment) => (
          <div
            key={comment.id}
            className="p-5 transition-all"
            style={{
              border: comment.is_spam_flagged
                ? "1px solid rgba(255,0,0,0.3)"
                : "1px solid #003b0f",
              background: comment.is_spam_flagged
                ? "rgba(255,0,0,0.03)"
                : "transparent",
              opacity: comment.is_spam_flagged ? 0.6 : 1,
            }}
          >
            {/* Comment author */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 flex items-center justify-center font-mono text-xs flex-shrink-0"
                style={{ border: "1px solid #003b0f", color: "#ff006e" }}
              >
                {(comment.author?.display_name ||
                  comment.author?.username ||
                  "?")[0].toUpperCase()}
              </div>
              <Link
                href={`/profile/${comment.author?.username}`}
                className="font-mono text-xs transition-all"
                style={{
                  color: "#ff006e",
                  textShadow: "0 0 4px rgba(255,0,110,0.3)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.textShadow =
                    "0 0 8px #ff006e";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.textShadow =
                    "0 0 4px rgba(255,0,110,0.3)";
                }}
              >
                @{comment.author?.username}
              </Link>
              <span
                className="text-xs"
                style={{
                  color: "#00f5ff",
                  textShadow: "0 0 4px rgba(0,245,255,0.3)",
                }}
              >
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
              {comment.is_spam_flagged && (
                <span
                  className="ml-auto text-xs uppercase px-1.5 py-0.5"
                  style={{
                    color: "#ff0000",
                    border: "1px solid rgba(255,0,0,0.4)",
                  }}
                >
                  spam
                </span>
              )}
              {comment.coins_received > 0 && (
                <span
                  className="ml-auto text-xs"
                  style={{
                    color: "#ffe600",
                    textShadow: "0 0 6px rgba(255,230,0,0.4)",
                  }}
                >
                  ¢ +{comment.coins_received}
                </span>
              )}
            </div>

            {/* Content */}
            <p
              className="font-mono text-sm leading-relaxed"
              style={{ color: "#00b32c" }}
            >
              {comment.content}
            </p>

            {/* Actions */}
            {currentUser &&
              !currentUser.is_banned &&
              currentUser.id !== comment.author_id && (
                <div
                  className="mt-4 pt-3 flex items-center gap-3 flex-wrap"
                  style={{ borderTop: "1px solid #003b0f" }}
                >
                  {/* Tip */}
                  <div className="flex items-center gap-2">
                    <input
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
                      className="h-7 w-20 text-xs px-2 font-mono"
                      style={{
                        background: "#000",
                        color: "#ffe600",
                        border: "1px solid #003b0f",
                      }}
                    />
                    <button
                      onClick={() => handleTip(comment.id)}
                      disabled={
                        loadingTip === comment.id || !tipAmounts[comment.id]
                      }
                      className="h-7 px-3 text-xs font-mono uppercase tracking-widest transition-all"
                      style={{
                        color: "#ffe600",
                        border: "1px solid #003b0f",
                        background: "#000",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "#ffe600";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                          "0 0 8px #ffe600";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "#003b0f";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                          "";
                      }}
                    >
                      ¢ tip
                    </button>
                  </div>

                  {/* Flag */}
                  <button
                    onClick={() => handleFlag(comment.id)}
                    disabled={loadingFlag === comment.id}
                    className="ml-auto h-7 px-3 text-xs font-mono uppercase tracking-widest transition-all"
                    style={{
                      color: "#003b0f",
                      border: "1px solid #003b0f",
                      background: "#000",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#ff0000";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#ff0000";
                      (e.currentTarget as HTMLButtonElement).style.textShadow =
                        "0 0 6px #ff0000";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#003b0f";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#003b0f";
                      (e.currentTarget as HTMLButtonElement).style.textShadow =
                        "";
                    }}
                  >
                    ⚑ flag spam{" "}
                    {comment.spam_flag_count > 0 &&
                      `(${comment.spam_flag_count})`}
                  </button>
                </div>
              )}
          </div>
        ))}

        {visibleComments.length === 0 && !currentUser && (
          <p
            className="text-center font-mono text-sm py-8"
            style={{ color: "#003b0f" }}
          >
            &gt; no responses yet. the void awaits.
          </p>
        )}
      </div>
    </div>
  );
}
