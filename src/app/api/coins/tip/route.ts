import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { tipComment } from '@/lib/coins';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tipper = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
      select: { id: true, coins: true, is_banned: true },
    });

    if (!tipper) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (tipper.is_banned) return NextResponse.json({ error: 'Your account is banned' }, { status: 403 });

    const body = await req.json();
    const { comment_id, amount } = body;

    if (!comment_id) return NextResponse.json({ error: 'comment_id required' }, { status: 400 });

    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive integer' }, { status: 400 });
    }

    const result = await tipComment(tipper.id, comment_id, amountNum);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const updated = await prisma.user.findUnique({
      where: { id: tipper.id },
      select: { coins: true },
    });

    return NextResponse.json({ success: true, newBalance: updated?.coins ?? 0 });
  } catch (err) {
    console.error('[POST /api/coins/tip]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
