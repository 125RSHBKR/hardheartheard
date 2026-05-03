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
    if (dbUser.coins < COIN_COSTS.COMMENT) {
      return NextResponse.json({ error: 'Insufficient coins. Need at least 3.' }, { status: 400 });
    }

    const body = await req.json();
    const { post_id, content } = body;

    if (!post_id) return NextResponse.json({ error: 'post_id required' }, { status: 400 });
    if (!content?.trim() || content.trim().length < 5) {
      return NextResponse.json({ error: 'Comment must be at least 5 characters' }, { status: 400 });
    }
    if (content.trim().length > 1000) {
      return NextResponse.json({ error: 'Comment must be under 1,000 characters' }, { status: 400 });
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: post_id, is_deleted: false },
      select: { id: true },
    });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        post_id,
        author_id: dbUser.id,
        content: content.trim(),
        coin_cost: COIN_COSTS.COMMENT,
      },
    });

    // Deduct coins
    const result = await deductCoins(dbUser.id, COIN_COSTS.COMMENT, 'COMMENT_COST', comment.id);

    return NextResponse.json({
      comment,
      newBalance: result.newBalance,
      banned: result.banned,
    });
  } catch (err) {
    console.error('[POST /api/comments]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('post_id');

    if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

    const comments = await prisma.comment.findMany({
      where: { post_id: postId, is_deleted: false },
      orderBy: { created_at: 'asc' },
      include: {
        author: {
          select: { id: true, username: true, display_name: true, avatar_url: true, is_banned: true },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (err) {
    console.error('[GET /api/comments]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
