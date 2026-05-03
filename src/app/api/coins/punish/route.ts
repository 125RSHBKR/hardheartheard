import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { flagSpam } from '@/lib/coins';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flagger = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
      select: { id: true, is_banned: true },
    });

    if (!flagger) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (flagger.is_banned) return NextResponse.json({ error: 'Your account is banned' }, { status: 403 });

    const body = await req.json();
    const { comment_id } = body;

    if (!comment_id) return NextResponse.json({ error: 'comment_id required' }, { status: 400 });

    const result = await flagSpam(flagger.id, comment_id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, punished: result.punished });
  } catch (err) {
    console.error('[POST /api/coins/punish]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
