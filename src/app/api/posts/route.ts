import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { deductCoins, COIN_COSTS } from '@/lib/coins';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
      select: { id: true, coins: true, is_banned: true },
    });

    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (dbUser.is_banned) return NextResponse.json({ error: 'Your account is banned' }, { status: 403 });
    if (dbUser.coins < COIN_COSTS.POST) {
      return NextResponse.json({ error: 'Insufficient coins. Need at least 10.' }, { status: 400 });
    }

    const body = await req.json();
    const { title, content } = body;

    if (!title?.trim() || title.trim().length > 200) {
      return NextResponse.json({ error: 'Title is required and must be under 200 characters' }, { status: 400 });
    }
    if (!content?.trim() || content.trim().length < 10) {
      return NextResponse.json({ error: 'Content must be at least 10 characters' }, { status: 400 });
    }
    if (content.trim().length > 10000) {
      return NextResponse.json({ error: 'Content must be under 10,000 characters' }, { status: 400 });
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        author_id: dbUser.id,
        title: title.trim(),
        content: content.trim(),
        coin_cost: COIN_COSTS.POST,
      },
    });

    // Deduct coins
    const result = await deductCoins(dbUser.id, COIN_COSTS.POST, 'POST_COST', post.id);

    return NextResponse.json({
      post,
      newBalance: result.newBalance,
      banned: result.banned,
    });
  } catch (err) {
    console.error('[POST /api/posts]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') === 'trending' ? 'trending' : 'recent';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);

    const posts = await prisma.post.findMany({
      where: { is_deleted: false },
      orderBy: sort === 'trending'
        ? [{ comments: { _count: 'desc' } }, { created_at: 'desc' }]
        : { created_at: 'desc' },
      take: limit,
      include: {
        author: {
          select: { id: true, username: true, display_name: true, avatar_url: true, is_banned: true },
        },
        _count: { select: { comments: { where: { is_deleted: false } } } },
      },
    });

    return NextResponse.json({ posts });
  } catch (err) {
    console.error('[GET /api/posts]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
