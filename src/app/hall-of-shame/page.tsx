import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Skull, Coins } from "lucide-react";

export const metadata = {
  title: "Hall of Shame — HardHeartHeard",
  description: "The fallen. Those who ran out of coins. The deceased.",
};

export default async function HallOfShamePage() {
  const shamed = await prisma.hallOfShame.findMany({
    orderBy: { banned_at: "desc" },
    include: {
      user: {
        select: { avatar_url: true },
      },
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-blood/40 bg-blood/10 mb-6">
          <Skull className="h-8 w-8 text-blood animate-flicker" />
        </div>
        <h1 className="font-display text-5xl font-black text-cream mb-4 tracking-tight">
          Hall of Shame
        </h1>
        <p className="font-serif text-cream-muted italic text-lg max-w-md mx-auto leading-relaxed">
          Here lie the names of those who spent everything they had —<br />
          and still it wasn't enough.
        </p>
        <div className="mt-4 text-xs text-cream-faint/60 font-sans uppercase tracking-[0.2em]">
          {shamed.length} {shamed.length === 1 ? "soul" : "souls"} departed
        </div>
      </div>

      {/* Decorative rule */}
      <div className="flex items-center gap-3 mb-10">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-blood/40" />
        <Skull className="h-4 w-4 text-blood/60" />
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-blood/40" />
      </div>

      {/* List */}
      {shamed.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl text-cream-faint mb-2">
            The hall is empty.
          </p>
          <p className="font-serif text-cream-faint/60 text-sm italic">
            Not yet. But it won't stay that way.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {shamed.map((entry: (typeof shamed)[number], index: number) => (
            <div
              key={entry.id}
              className="group relative flex items-start gap-4 p-5 border border-cream/5 rounded-lg bg-ink-50 hover:border-blood/20 transition-all duration-300"
            >
              {/* Number */}
              <div className="flex-shrink-0 w-8 text-center">
                <span className="text-xs text-cream-faint/40 font-sans tabular-nums">
                  {String(index + 1).padStart(3, "0")}
                </span>
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-ink border border-blood/20 flex items-center justify-center overflow-hidden grayscale opacity-60">
                  {entry.user?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.user.avatar_url}
                      alt={entry.display_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Skull className="h-6 w-6 text-blood/40" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <Link
                      href={`/profile/${entry.username}`}
                      className="font-display text-lg font-bold text-cream-faint hover:text-blood transition-colors line-through decoration-blood/50"
                    >
                      {entry.display_name}
                    </Link>
                    <p className="text-xs text-cream-faint/60 mt-0.5">
                      @{entry.username}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-blood/70">
                      <Coins className="h-3 w-3" />
                      <span>Final balance: {entry.final_coin_balance}</span>
                    </div>
                    <p className="text-xs text-cream-faint/40 mt-0.5">
                      {new Date(entry.banned_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <p className="mt-2 text-xs text-cream-faint/60 font-serif italic">
                  "{entry.reason}"
                </p>
              </div>

              {/* Blood drip accent */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blood/0 group-hover:bg-blood/30 transition-all duration-300 rounded-l-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Footer epitaph */}
      <div className="mt-16 text-center">
        <p className="font-serif text-cream-faint/40 text-sm italic">
          "They spent every coin they had.
          <br />
          In the end, silence claimed them."
        </p>
      </div>
    </div>
  );
}
