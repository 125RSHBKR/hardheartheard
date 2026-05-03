import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

export const metadata: Metadata = {
  title: "HardHeartHeard — Attention is Currency",
  description:
    "A dystopian poetry exchange where attention is currency and silence is death. Every word costs. Every silence kills.",
  openGraph: {
    title: "HardHeartHeard",
    description: "Attention is currency. Silence is death.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  let dbUser = null;

  if (supabaseUser?.email) {
    try {
      dbUser = await prisma.user.findUnique({
        where: { email: supabaseUser.email },
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true,
          coins: true,
          is_admin: true,
          is_banned: true,
        },
      });

      // Auto-create user on first login
      if (!dbUser) {
        const username =
          supabaseUser.user_metadata?.preferred_username ||
          supabaseUser.email
            .split("@")[0]
            .replace(/[^a-z0-9_]/gi, "_")
            .toLowerCase() ||
          `user_${Date.now()}`;

        const display_name =
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name ||
          username;

        const avatar_url =
          supabaseUser.user_metadata?.avatar_url ||
          supabaseUser.user_metadata?.picture ||
          null;

        dbUser = await prisma.user.create({
          data: {
            id: supabaseUser.id,
            email: supabaseUser.email,
            username,
            display_name,
            avatar_url,
            is_admin: isAdminEmail(supabaseUser.email),
          },
          select: {
            id: true,
            username: true,
            display_name: true,
            avatar_url: true,
            coins: true,
            is_admin: true,
            is_banned: true,
          },
        });
      }
    } catch (err) {
      console.error("Error fetching/creating user:", err);
    }
  }

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-black text-[#00ff41] min-h-screen font-mono"
        style={{ backgroundColor: "#000", color: "#00ff41" }}
      >
        <Navbar user={dbUser} />
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
