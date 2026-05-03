import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/PostCard";
import { CoinBalance } from "@/components/CoinBalance";
import { Button } from "@/components/ui/button";
import { User, ExternalLink, MessageSquare, Skull, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedPost, UserLink } from "@/types";

interface ProfilePageProps {
  params: { username: string };
}

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
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Profile header */}
      <div className={cn("mb-10", profile.is_banned && "opacity-80")}>
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-20 w-20 rounded-full bg-ink-50 border-2 border-cream/20 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-cream-faint" />
              )}
            </div>
            {profile.is_banned && (
              <div className="absolute -bottom-1 -right-1 bg-blood rounded-full p-1">
                <Skull className="h-3.5 w-3.5 text-cream" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1
                  className={cn(
                    "font-display text-2xl font-bold leading-tight",
                    profile.is_banned
                      ? "text-cream-faint line-through"
                      : "text-cream",
                  )}
                >
                  {profile.display_name}
                </h1>
                <p className="text-cream-faint text-sm">@{profile.username}</p>
              </div>

              <div className="flex items-center gap-2">
                {profile.is_banned ? (
                  <span className="text-xs font-sans text-blood border border-blood/40 px-3 py-1 rounded-sm tracking-widest uppercase">
                    DECEASED
                  </span>
                ) : (
                  <CoinBalance balance={profile.coins} size="md" />
                )}

                {!isOwnProfile &&
                  currentUser &&
                  !currentUser.is_banned &&
                  !profile.is_banned && (
                    <Link href={`/dm/${profile.username}`}>
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        DM
                      </Button>
                    </Link>
                  )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-3 font-serif text-sm text-cream-muted leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Links */}
            {links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="mt-4 flex items-center gap-5 text-xs text-cream-faint">
              <span>
                <span className="text-cream font-semibold">
                  {profile._count.posts}
                </span>{" "}
                confessions
              </span>
              <span>
                <span className="text-cream font-semibold">
                  {profile._count.comments}
                </span>{" "}
                responses
              </span>
              <span>
                Joined{" "}
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Ban notice */}
        {profile.is_banned && (
          <div className="mt-6 p-4 border border-blood/30 bg-blood/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Skull className="h-4 w-4 text-blood" />
              <span className="text-sm font-semibold text-blood uppercase tracking-wider">
                Account Deceased
              </span>
            </div>
            <p className="text-xs text-cream-muted">
              Reason: {profile.ban_reason || "Coin balance reached zero."}
              {profile.banned_at && (
                <>
                  {" "}
                  · Departed {new Date(profile.banned_at).toLocaleDateString()}
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Posts */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 border-t border-cream/10" />
          <span className="text-xs text-cream-faint uppercase tracking-widest font-sans">
            Confessions
          </span>
          <div className="flex-1 border-t border-cream/10" />
        </div>

        {posts.length === 0 ? (
          <p className="text-center font-serif text-cream-faint italic py-12">
            {profile.is_banned
              ? "Their words have been silenced."
              : "No confessions yet."}
          </p>
        ) : (
          <div className="grid gap-4">
            {posts.map((post: (typeof posts)[number]) => (
              <PostCard key={post.id} post={post as unknown as FeedPost} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
