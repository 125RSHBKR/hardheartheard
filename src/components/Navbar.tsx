"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CoinBalance } from "./CoinBalance";

interface NavbarProps {
  user?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string | null;
    coins: number;
    is_admin: boolean;
    is_banned: boolean;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <nav
      className="sticky top-0 z-40 bg-black"
      style={{
        borderBottom: "1px solid #00ff41",
        boxShadow:
          "0 0 12px #00ff41, 0 0 24px #00f5ff, 0 2px 20px rgba(0,255,65,0.15)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="glow-green font-mono text-base font-bold tracking-widest uppercase"
          style={{ color: "#00ff41", textDecoration: "none" }}
        >
          &gt; HARDHEARTHEARD
        </Link>

        {/* Center nav */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest transition-all"
            style={{ color: "#003b0f" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#00f5ff";
              (e.currentTarget as HTMLAnchorElement).style.textShadow =
                "0 0 8px #00f5ff, 0 0 20px #00f5ff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#003b0f";
              (e.currentTarget as HTMLAnchorElement).style.textShadow = "";
            }}
          >
            ~ FEED
          </Link>
          <Link
            href="/write"
            className="font-mono text-xs uppercase tracking-widest transition-all"
            style={{ color: "#003b0f" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#00ff41";
              (e.currentTarget as HTMLAnchorElement).style.textShadow =
                "0 0 8px #00ff41, 0 0 20px #00ff41";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#003b0f";
              (e.currentTarget as HTMLAnchorElement).style.textShadow = "";
            }}
          >
            + WRITE
          </Link>
          <Link
            href="/hall-of-shame"
            className="font-mono text-xs uppercase tracking-widest transition-all"
            style={{ color: "#003b0f" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#ff006e";
              (e.currentTarget as HTMLAnchorElement).style.textShadow =
                "0 0 8px #ff006e, 0 0 20px #ff006e";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#003b0f";
              (e.currentTarget as HTMLAnchorElement).style.textShadow = "";
            }}
          >
            &#9760; SHAME
          </Link>
          {user?.is_admin && (
            <Link
              href="/admin"
              className="font-mono text-xs uppercase tracking-widest transition-all"
              style={{ color: "#ffe600" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.textShadow =
                  "0 0 8px #ffe600, 0 0 20px #ffe600";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.textShadow = "";
              }}
            >
              &#9881; ADMIN
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Coin balance */}
              <CoinBalance balance={user.coins} size="sm" />

              {/* Profile */}
              <Link
                href={`/profile/${user.username}`}
                className="font-mono text-xs uppercase tracking-widest transition-all"
                style={{ color: "#003b0f" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#00f5ff";
                  (e.currentTarget as HTMLAnchorElement).style.textShadow =
                    "0 0 8px #00f5ff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#003b0f";
                  (e.currentTarget as HTMLAnchorElement).style.textShadow = "";
                }}
              >
                &#9670; {user.username}
              </Link>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="font-mono text-xs uppercase tracking-widest transition-all"
                style={{
                  color: "#003b0f",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#ff006e";
                  (e.currentTarget as HTMLButtonElement).style.textShadow =
                    "0 0 8px #ff006e";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#003b0f";
                  (e.currentTarget as HTMLButtonElement).style.textShadow = "";
                }}
                title="sign out"
              >
                [ EXIT ]
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="font-mono text-xs uppercase tracking-widest transition-all"
              style={{
                color: "#00ff41",
                background: "none",
                border: "1px solid #00ff41",
                padding: "4px 10px",
                cursor: "pointer",
                boxShadow: "0 0 8px rgba(0,255,65,0.3)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 16px #00ff41, inset 0 0 8px rgba(0,255,65,0.1)";
                (e.currentTarget as HTMLButtonElement).style.textShadow =
                  "0 0 8px #00ff41";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 8px rgba(0,255,65,0.3)";
                (e.currentTarget as HTMLButtonElement).style.textShadow = "";
              }}
            >
              [ SIGN IN ]
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
