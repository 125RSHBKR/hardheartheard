import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { logFingerprint, updateUserFingerprint } from '@/lib/fingerprint';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    const body = await req.json();
    const { fingerprint_hash, user_agent } = body;

    if (!fingerprint_hash) {
      return NextResponse.json({ error: 'fingerprint_hash required' }, { status: 400 });
    }

    // Get IP from headers
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0';

    const ua = user_agent || req.headers.get('user-agent') || 'unknown';

    let userId: string | undefined;

    if (supabaseUser?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: supabaseUser.email },
        select: { id: true },
      });
      if (dbUser) {
        userId = dbUser.id;
        await updateUserFingerprint(dbUser.id, fingerprint_hash, ip);
      }
    }

    await logFingerprint({ hash: fingerprint_hash, ipAddress: ip, userAgent: ua, userId });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/fingerprint]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
