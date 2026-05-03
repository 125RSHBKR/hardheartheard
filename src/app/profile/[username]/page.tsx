import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/PostCard";
import { CoinBalance } from "@/components/CoinBalance";
import type { FeedPost, UserLink } from "@/types";

interface ProfilePageProps {
  params: { username: string };
}

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

export async function generateMetadata({ params }: ProfilePageProps) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { display_name: true, bio: true },
  });
  if (!user) return { title: "Not found" };
  return {
    title: `${user.display_name} (@${params.username}) — HardHeartHeard`,
    description:
      user.bio ?? `${user.display_name}'s profile on HardHeartHeard.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  const profile = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      username: true,
      display_name: true,
      bio: true,
      avatar_url: true,
      links: true,
      coins: true,
      is_banned: true,
      ban_reason: true,
      banned_at: true,
      is_admin: true,
      created_at: true,
      _count: {
        select: {
          posts: { where: { is_deleted: false } },
          comments: { where: { is_deleted: false } },
        },
      },
    },
  });

  if (!profile) notFound();

  const posts = await prisma.post.findMany({
    where: { author_id: profile.id, is_deleted: false },
    orderBy: { created_at: "desc" },
    take: 20,
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

  let currentUser = null;
  if (supabaseUser?.email) {
    currentUser = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
      select: { id: true, username: true, is_banned: true },
    });
  }

  const isOwnProfile = currentUser?.id === profile.id;
  const links = (profile.links as unknown as UserLink[]) ?? [];

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "40px 16px",
        fontFamily: mono,
        background: C.black,
        minHeight: "100vh",
      }}
    >
      {/* ── profile header ── */}
      <div
        style={{ marginBottom: "40px", opacity: profile.is_banned ? 0.8 : 1 }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
          {/* avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                border: `2px solid ${profile.is_banned ? C.red : C.dimGreen}`,
                boxShadow: boxGlow(profile.is_banned ? C.red : C.dimGreen),
                background: C.black,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: profile.is_banned ? "grayscale(80%)" : "none",
                  }}
                />
              ) : (
                <span style={{ color: C.dimGreen, fontSize: "32px" }}>◈</span>
              )}
            </div>
            {profile.is_banned && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  right: "-4px",
                  background: C.red,
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                }}
              >
                ☠
              </div>
            )}
          </div>

          {/* info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h1
                  style={{
                    fontFamily: mono,
                    fontSize: "22px",
                    color: profile.is_banned ? C.dimGreen : C.pink,
                    textShadow: profile.is_banned ? "none" : glow(C.pink),
                    margin: "0 0 2px",
                    textTransform: "lowercase",
                    textDecoration: profile.is_banned ? "line-through" : "none",
                    textDecorationColor: C.red,
                  }}
                >
                  {profile.display_name}
                </h1>
                <p
                  style={{
                    fontFamily: mono,
                    fontSize: "12px",
                    color: C.dimGreen,
                    margin: 0,
                  }}
                >
                  @{profile.username}
                </p>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                {profile.is_banned ? (
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: "11px",
                      color: C.red,
                      border: `1px solid ${C.red}`,
                      padding: "3px 10px",
                      textShadow: glow(C.red),
                      letterSpacing: "0.15em",
                    }}
                  >
                    ☠ DECEASED
                  </span>
                ) : (
                  <CoinBalance balance={profile.coins} size="md" />
                )}

                {!isOwnProfile &&
                  currentUser &&
                  !currentUser.is_banned &&
                  !profile.is_banned && (
                    <Link
                      href={`/dm/${profile.username}`}
                      style={{
                        fontFamily: mono,
                        fontSize: "12px",
                        color: C.cyan,
                        border: `1px solid ${C.cyan}`,
                        padding: "4px 12px",
                        textDecoration: "none",
                        boxShadow: boxGlow(C.cyan),
                        letterSpacing: "0.08em",
                      }}
                    >
                      &gt; dm
                    </Link>
                  )}
              </div>
            </div>

            {/* bio */}
            {profile.bio && (
              <p
                style={{
                  fontFamily: mono,
                  fontSize: "12px",
                  color: C.dimGreen,
                  marginTop: "12px",
                  lineHeight: "1.7",
                }}
              >
                {profile.bio}
              </p>
            )}

            {/* links */}
            {links.length > 0 && (
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: mono,
                      fontSize: "11px",
                      color: C.yellow,
                      textDecoration: "none",
                      textShadow: glow(C.yellow),
                    }}
                  >
                    &gt; {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* stats */}
            <div
              style={{
                marginTop: "14px",
                display: "flex",
                gap: "20px",
                fontFamily: mono,
                fontSize: "11px",
                color: C.dimGreen,
              }}
            >
              <span>
                <span style={{ color: C.green, textShadow: glow(C.green) }}>
                  {profile._count.posts}
                </span>{" "}
                confessions
              </span>
              <span>
                <span style={{ color: C.green, textShadow: glow(C.green) }}>
                  {profile._count.comments}
                </span>{" "}
                responses
              </span>
              <span>
                joined{" "}
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* ban notice */}
        {profile.is_banned && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              border: `1px solid ${C.red}`,
              borderLeft: `3px solid ${C.red}`,
              background: C.black,
              boxShadow: boxGlow(C.red),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "6px",
              }}
            >
              <span style={{ color: C.red, fontSize: "14px" }}>☠</span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: "12px",
                  color: C.red,
                  textShadow: glow(C.red),
                  letterSpacing: "0.15em",
                }}
              >
                ACCOUNT DECEASED
              </span>
            </div>
            <p
              style={{
                fontFamily: mono,
                fontSize: "11px",
                color: C.dimGreen,
                margin: 0,
              }}
            >
              reason: {profile.ban_reason || "coin balance reached zero."}
              {profile.banned_at && (
                <>
                  {" "}
                  · departed {new Date(profile.banned_at).toLocaleDateString()}
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* ── posts section ── */}
      <div>
        {/* divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: C.dimGreen }} />
          <span
            style={{
              fontFamily: mono,
              fontSize: "10px",
              color: C.cyan,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            confessions
          </span>
          <div style={{ flex: 1, height: "1px", background: C.dimGreen }} />
        </div>

        {posts.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              fontFamily: mono,
              fontSize: "13px",
              color: C.dimGreen,
              padding: "48px 0",
            }}
          >
            {profile.is_banned
              ? "their words have been silenced."
              : "no confessions yet."}
          </p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {posts.map((post: (typeof posts)[number]) => (
              <PostCard key={post.id} post={post as unknown as FeedPost} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
