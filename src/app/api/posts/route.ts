import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";
import { deductCoins, postCost } from "@/lib/coins";

/** Resolve the calling user from either a cookie session (web) or Bearer token (Android/API). */
async function getCallerEmail(req: NextRequest): Promise<string | null> {
  // 1. Try Bearer token first (Android app)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const {
      data: { user },
    } = await serviceClient.auth.getUser(token);
    return user?.email ?? null;
  }
  // 2. Fall back to cookie session (browser)
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const email = await getCallerEmail(req);
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, coins: true, is_banned: true },
    });

    if (!dbUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (dbUser.is_banned)
      return NextResponse.json(
        { error: "Your account is banned" },
        { status: 403 },
      );
    // We need body before we can compute cost; parse body first
    // (we'll re-validate below after parse)

    const body = await req.json();
    const { title, content } = body;

    if (!title?.trim() || title.trim().length > 200) {
      return NextResponse.json(
        { error: "Title is required and must be under 200 characters" },
        { status: 400 },
      );
    }
    if (!content?.trim() || content.trim().length < 10) {
      return NextResponse.json(
        { error: "Content must be at least 10 characters" },
        { status: 400 },
      );
    }
    if (content.trim().length > 10000) {
      return NextResponse.json(
        { error: "Content must be under 10,000 characters" },
        { status: 400 },
      );
    }

    const totalChars = title.trim().length + content.trim().length;
    const cost = postCost(totalChars);

    if (dbUser.coins < cost) {
      return NextResponse.json(
        {
          error: `Insufficient coins. This post costs ¢ ${cost} (${totalChars} chars). You have ¢ ${dbUser.coins}.`,
        },
        { status: 400 },
      );
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        author_id: dbUser.id,
        title: title.trim(),
        content: content.trim(),
        coin_cost: cost,
      },
    });

    // Deduct coins
    const result = await deductCoins(dbUser.id, cost, "POST_COST", post.id);

    return NextResponse.json({
      post,
      newBalance: result.newBalance,
      banned: result.banned,
    });
  } catch (err) {
    console.error("[POST /api/posts]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sort =
      searchParams.get("sort") === "trending" ? "trending" : "recent";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

    const posts = await prisma.post.findMany({
      where: { is_deleted: false },
      orderBy:
        sort === "trending"
          ? [{ comments: { _count: "desc" } }, { created_at: "desc" }]
          : { created_at: "desc" },
      take: limit,
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

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("[GET /api/posts]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
