"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { FeedPost } from "@/types";

interface PostCardProps {
  post: FeedPost;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function PostCard({ post }: PostCardProps) {
  const isDeceasedAuthor = post.author.is_banned;
  const isDeleted = post.is_deleted;

  const firstLetter = (post.author.display_name ||
    post.author.username ||
    "?")[0].toUpperCase();

  return (
    <article
      className={cn(
        "group relative bg-black overflow-hidden animate-fade-in",
        "transition-all duration-200",
        (isDeceasedAuthor || isDeleted) && "opacity-60",
      )}
      style={{
        border: "1px solid var(--c-border)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.border =
          "1px solid var(--c-primary)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 0 12px var(--c-primary)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.border =
          "1px solid var(--c-border)";
        (e.currentTarget as HTMLElement).style.boxShadow = "";
      }}
    >
      {/* DECEASED watermark */}
      {isDeceasedAuthor && !isDeleted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span className="deceased-stamp">DECEASED</span>
        </div>
      )}

      {/* Left accent border on hover */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: "var(--c-primary)",
          boxShadow: "0 0 8px var(--c-primary)",
        }}
      />

      <Link href={`/post/${post.id}`} className="block p-5">
        {/* Author info */}
        <div className="flex items-center gap-2 mb-3">
          {/* Avatar box */}
          <div
            className="w-7 h-7 flex items-center justify-center flex-shrink-0 font-mono text-xs"
            style={{
              border: "1px solid var(--c-border)",
              color: "var(--c-muted)",
              background: "var(--c-bg)",
            }}
          >
            {firstLetter}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/profile/${post.author.username}`}
              className={cn(
                "text-xs font-mono truncate transition-colors",
                isDeceasedAuthor ? "line-through" : "",
              )}
              style={{
                color: isDeceasedAuthor ? "var(--c-muted)" : "var(--c-pink)",
                textShadow: isDeceasedAuthor ? "" : "var(--c-glow-pink)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              @{post.author.username}
            </Link>
            {isDeceasedAuthor && (
              <span
                className="text-xs font-mono"
                style={{
                  color: "var(--c-red)",
                  textShadow: "var(--c-glow-red)",
                }}
              >
                [DECEASED]
              </span>
            )}
          </div>

          <span
            className="ml-auto text-xs font-mono flex-shrink-0"
            style={{
              color: "var(--c-cyan)",
              textShadow: "var(--c-glow-cyan)",
            }}
          >
            {formatTimeAgo(post.created_at)}
          </span>
        </div>

        {/* Title */}
        <h2
          className={cn(
            "font-mono text-base font-bold mb-2 leading-snug uppercase tracking-wide",
          )}
          style={{
            color: isDeceasedAuthor ? "var(--c-muted)" : "var(--c-primary)",
            textShadow: isDeceasedAuthor ? "" : "var(--c-glow-primary)",
          }}
        >
          {post.title}
        </h2>

        {/* Content preview */}
        <p
          className="font-mono text-xs leading-relaxed line-clamp-3"
          style={{ color: "var(--c-secondary)" }}
        >
          {post.content}
        </p>

        {/* Footer */}
        <div
          className="mt-4 pt-3 flex items-center gap-4"
          style={{ borderTop: "1px solid var(--c-border)" }}
        >
          <span
            className="font-mono text-xs"
            style={{
              color: "var(--c-cyan)",
              textShadow: "var(--c-glow-cyan)",
            }}
          >
            // {post._count.comments}{" "}
            {post._count.comments === 1 ? "response" : "responses"}
          </span>
          <span
            className="font-mono text-xs ml-auto"
            style={{ color: "var(--c-muted)" }}
          >
            ¢ {post.coin_cost} cost
          </span>
        </div>
      </Link>
    </article>
  );
}
