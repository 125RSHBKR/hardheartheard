'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CoinBalance } from './CoinBalance';
import { Button } from './ui/button';
import { PenLine, Skull, Home, User, LogOut, Shield } from 'lucide-react';

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
    router.push('/');
    router.refresh();
  };

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-cream/10 bg-ink/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-lg font-bold text-cream hover:text-gold transition-colors tracking-wide"
        >
          Hard<span className="text-blood">Heart</span>Heard
        </Link>

        {/* Center nav */}
        <div className="hidden sm:flex items-center gap-1">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-cream-muted hover:text-cream">
              <Home className="h-4 w-4" />
              <span>Feed</span>
            </Button>
          </Link>
          <Link href="/hall-of-shame">
            <Button variant="ghost" size="sm" className="gap-1.5 text-cream-muted hover:text-blood">
              <Skull className="h-4 w-4" />
              <span>Hall of Shame</span>
            </Button>
          </Link>
          {user?.is_admin && (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5 text-gold hover:text-gold-light">
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Coin balance */}
              <CoinBalance balance={user.coins} size="sm" />

              {/* Write button */}
              {!user.is_banned && (
                <Link href="/write">
                  <Button size="sm" className="gap-1.5 hidden sm:flex">
                    <PenLine className="h-3.5 w-3.5" />
                    <span>Write</span>
                  </Button>
                </Link>
              )}

              {/* Profile dropdown */}
              <Link href={`/profile/${user.username}`}>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt={user.display_name}
                      className="h-8 w-8 rounded-full border border-cream/20 object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full border border-cream/20 bg-ink-50 flex items-center justify-center">
                      <User className="h-4 w-4 text-cream-muted" />
                    </div>
                  )}
                </button>
              </Link>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="text-cream-faint hover:text-cream transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Button size="sm" onClick={handleSignIn} className="gap-1.5">
              Sign in with Google
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
