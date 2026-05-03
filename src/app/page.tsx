import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { PostCard } from "@/components/PostCard";
import { createClient } from "@/lib/supabase/server";
import type { FeedPost } from "@/types";

type SortMode = "recent" | "trending";

interface FeedPageProps {
  searchParams: { sort?: string };
}

async function getPosts(sort: SortMode): Promise<FeedPost[]> {
  const posts = await prisma.post.findMany({
    where: { is_deleted: false },
    orderBy:
      sort === "trending"
        ? [{ comments: { _count: "desc" } }, { created_at: "desc" }]
        : { created_at: "desc" },
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
  const sort: SortMode =
    searchParams.sort === "trending" ? "trending" : "recent";
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const posts = await getPosts(sort);

  const stats = await prisma.$transaction([
    prisma.user.count({ where: { is_banned: false } }),
    prisma.post.count({ where: { is_deleted: false } }),
    prisma.user.aggregate({ _sum: { coins: true } }),
  ]);

  const [userCount, postCount, coinAgg] = stats;
  const totalCoins = coinAgg._sum.coins ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-mono">
      {/* VHS divider */}
      <div className="vhs-line mb-8" />

      {/* Hero */}
      <div className="mb-10">
        <div className="mb-2">
          <span
            className="text-xs font-mono uppercase tracking-[0.4em]"
            style={{ color: "#ff006e", textShadow: "0 0 8px #ff006e" }}
          >
            // dystopian poetry exchange
          </span>
        </div>
        <h1
          className="font-mono text-3xl sm:text-5xl font-bold uppercase tracking-widest mb-3 leading-tight"
          style={{
            color: "#00ff41",
            textShadow:
              "0 0 10px #00ff41, 0 0 30px #00ff41, 0 0 60px rgba(0,255,65,0.4)",
          }}
        >
          EVERY WORD COSTS.
          <br />
          <span
            style={{
              color: "#ff006e",
              textShadow: "0 0 10px #ff006e, 0 0 30px #ff006e",
            }}
          >
            EVERY SILENCE KILLS.
          </span>
        </h1>
        <p className="font-mono text-sm max-w-lg" style={{ color: "#003b0f" }}>
          &gt; attention is currency in this dying world. spend wisely._
        </p>

        {/* Economy stats bar */}
        <div
          className="mt-6 inline-flex flex-wrap items-center gap-4 font-mono text-xs px-4 py-2"
          style={{ border: "1px solid #003b0f", color: "#003b0f" }}
        >
          <span>
            <span style={{ color: "#ffe600", textShadow: "0 0 8px #ffe600" }}>
              ¢ {totalCoins.toLocaleString()}
            </span>{" "}
            coins in circulation
          </span>
          <span style={{ color: "#003b0f" }}>|</span>
          <span>
            <span style={{ color: "#00ff41" }}>
              {userCount.toLocaleString()}
            </span>{" "}
            souls
          </span>
          <span style={{ color: "#003b0f" }}>|</span>
          <span>
            <span style={{ color: "#00ff41" }}>
              {postCount.toLocaleString()}
            </span>{" "}
            confessions
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link
            href="/?sort=recent"
            className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 transition-all"
            style={
              sort === "recent"
                ? {
                    color: "#00ff41",
                    border: "1px solid #00ff41",
                    boxShadow: "0 0 8px rgba(0,255,65,0.4)",
                    textShadow: "0 0 8px #00ff41",
                  }
                : {
                    color: "#003b0f",
                    border: "1px solid #003b0f",
                  }
            }
          >
            [ RECENT ]
          </Link>
          <Link
            href="/?sort=trending"
            className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 transition-all"
            style={
              sort === "trending"
                ? {
                    color: "#00ff41",
                    border: "1px solid #00ff41",
                    boxShadow: "0 0 8px rgba(0,255,65,0.4)",
                    textShadow: "0 0 8px #00ff41",
                  }
                : {
                    color: "#003b0f",
                    border: "1px solid #003b0f",
                  }
            }
          >
            [ TRENDING ]
          </Link>
        </div>

        {user && (
          <Link
            href="/write"
            className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 transition-all"
            style={{
              color: "#00ff41",
              border: "1px solid #00ff41",
              boxShadow: "0 0 8px rgba(0,255,65,0.3)",
            }}
          >
            + WRITE
          </Link>
        )}
      </div>

      {/* VHS divider */}
      <div className="vhs-line mb-6" />

      {/* Posts feed */}
      {posts.length === 0 ? (
        <div className="py-24 text-center">
          <p
            className="font-mono text-xl uppercase tracking-widest cursor"
            style={{ color: "#003b0f" }}
          >
            &gt; THE VOID IS SILENT.
          </p>
          <p className="font-mono text-xs mt-2" style={{ color: "#003b0f" }}>
            // be the first to break the silence
          </p>
          {user && (
            <Link
              href="/write"
              className="mt-6 inline-block font-mono text-xs uppercase tracking-widest px-4 py-2 transition-all"
              style={{
                color: "#00ff41",
                border: "1px solid #00ff41",
                boxShadow: "0 0 8px rgba(0,255,65,0.3)",
              }}
            >
              + WRITE THE FIRST POEM
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Unauthenticated CTA */}
      {!user && posts.length > 0 && (
        <div
          className="mt-12 p-6 font-mono"
          style={{
            border: "1px solid #ff006e",
            boxShadow: "0 0 12px rgba(255,0,110,0.15)",
          }}
        >
          <p
            className="text-base uppercase tracking-widest mb-2"
            style={{ color: "#ff006e", textShadow: "0 0 8px #ff006e" }}
          >
            &gt; you are a ghost here.
          </p>
          <p className="text-xs mb-3" style={{ color: "#003b0f" }}>
            // sign in to spend your 10,000 starting coins and make yourself
            heard.
          </p>
          <p className="text-xs" style={{ color: "#003b0f" }}>
            // max 144,000 souls. 1,440,000,000 coins total in this economy.
          </p>
        </div>
      )}
    </div>
  );
}
