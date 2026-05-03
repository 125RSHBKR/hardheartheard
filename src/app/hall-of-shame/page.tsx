import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Hall of Shame — HardHeartHeard",
  description: "The fallen. Those who ran out of coins. The deceased.",
};

/* ─── colour tokens ─────────────────────────────────── */
const C = {
  green: "#00ff41",
  cyan: "#00f5ff",
  pink: "#ff006e",
  yellow: "#ffe600",
  red: "#ff0000",
  dimGreen: "#003b0f",
  black: "#000000",
} as const;

const glow = (c: string) => `0 0 8px ${c}, 0 0 20px ${c}`;
const boxGlow = (c: string) => `0 0 8px ${c}`;
const mono = "'Share Tech Mono', monospace";

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
    <div
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "48px 16px",
        fontFamily: mono,
        background: C.black,
        minHeight: "100vh",
      }}
    >
      {/* ── header ── */}
      <div style={{ textAlign: "center", marginBottom: "56px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            border: `2px solid ${C.red}`,
            boxShadow: boxGlow(C.red),
            background: C.black,
            marginBottom: "24px",
          }}
        >
          <span
            style={{ fontSize: "28px", color: C.red, textShadow: glow(C.red) }}
          >
            ☠
          </span>
        </div>

        <h1
          style={{
            fontFamily: mono,
            fontSize: "36px",
            color: C.red,
            textShadow: glow(C.red),
            textTransform: "lowercase",
            margin: "0 0 16px",
            letterSpacing: "0.04em",
          }}
        >
          hall of shame
        </h1>

        <p
          style={{
            fontFamily: mono,
            fontSize: "13px",
            color: C.dimGreen,
            lineHeight: "1.8",
            maxWidth: "440px",
            margin: "0 auto 12px",
          }}
        >
          here lie the names of those who spent everything they had —<br />
          and still it wasn&apos;t enough.
        </p>

        <div
          style={{
            fontFamily: mono,
            fontSize: "10px",
            color: C.cyan,
            textShadow: glow(C.cyan),
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {shamed.length} {shamed.length === 1 ? "soul" : "souls"} departed
        </div>
      </div>

      {/* ── divider ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{ flex: 1, height: "1px", background: C.red, opacity: 0.3 }}
        />
        <span style={{ color: C.red, fontSize: "14px" }}>☠</span>
        <div
          style={{ flex: 1, height: "1px", background: C.red, opacity: 0.3 }}
        />
      </div>

      {/* ── list ── */}
      {shamed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p
            style={{
              fontFamily: mono,
              fontSize: "20px",
              color: C.dimGreen,
              marginBottom: "8px",
            }}
          >
            the hall is empty.
          </p>
          <p
            style={{
              fontFamily: mono,
              fontSize: "12px",
              color: C.dimGreen,
              opacity: 0.6,
            }}
          >
            not yet. but it won&apos;t stay that way.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {shamed.map((entry: (typeof shamed)[number], index: number) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
                padding: "20px",
                border: `1px solid ${C.dimGreen}`,
                background: C.black,
                borderLeft: `3px solid ${C.red}`,
                boxShadow: boxGlow(C.red),
                position: "relative",
              }}
            >
              {/* index */}
              <div
                style={{ flexShrink: 0, width: "32px", textAlign: "center" }}
              >
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: "10px",
                    color: C.dimGreen,
                    letterSpacing: "0.05em",
                  }}
                >
                  {String(index + 1).padStart(3, "0")}
                </span>
              </div>

              {/* avatar */}
              <div
                style={{
                  flexShrink: 0,
                  width: "48px",
                  height: "48px",
                  border: `1px solid ${C.red}`,
                  background: C.black,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  filter: "grayscale(100%)",
                  opacity: 0.6,
                }}
              >
                {entry.user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.user.avatar_url}
                    alt={entry.display_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ color: C.red, fontSize: "20px" }}>☠</span>
                )}
              </div>

              {/* info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <Link
                      href={`/profile/${entry.username}`}
                      style={{
                        fontFamily: mono,
                        fontSize: "16px",
                        color: C.dimGreen,
                        textDecoration: "line-through",
                        textDecorationColor: C.red,
                        display: "block",
                      }}
                    >
                      {entry.display_name}
                    </Link>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: "11px",
                        color: C.dimGreen,
                        opacity: 0.6,
                      }}
                    >
                      @{entry.username}
                    </span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: C.red,
                        fontFamily: mono,
                        fontSize: "11px",
                      }}
                    >
                      <span>¢</span>
                      <span>final: {entry.final_coin_balance}</span>
                    </div>
                    <p
                      style={{
                        fontFamily: mono,
                        fontSize: "10px",
                        color: C.dimGreen,
                        opacity: 0.5,
                        marginTop: "2px",
                      }}
                    >
                      {new Date(entry.banned_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <p
                  style={{
                    fontFamily: mono,
                    fontSize: "11px",
                    color: C.dimGreen,
                    marginTop: "8px",
                    opacity: 0.7,
                  }}
                >
                  &quot;{entry.reason}&quot;
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── footer epitaph ── */}
      <div style={{ marginTop: "64px", textAlign: "center" }}>
        <p
          style={{
            fontFamily: mono,
            fontSize: "11px",
            color: C.dimGreen,
            opacity: 0.45,
            lineHeight: "1.8",
          }}
        >
          &quot;they spent every coin they had.
          <br />
          in the end, silence claimed them.&quot;
        </p>
      </div>
    </div>
  );
}
