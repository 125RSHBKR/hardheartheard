import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { transferCoins } from '@/lib/coins';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sender = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
      select: { id: true, coins: true, is_banned: true },
    });

    if (!sender) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (sender.is_banned) return NextResponse.json({ error: 'Your account is banned' }, { status: 403 });

    const body = await req.json();
    const { to_username, amount, message } = body;

    if (!to_username) return NextResponse.json({ error: 'to_username required' }, { status: 400 });

    const recipient = await prisma.user.findUnique({
      where: { username: to_username },
      select: { id: true, is_banned: true },
    });

    if (!recipient) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    if (recipient.is_banned) return NextResponse.json({ error: 'Recipient account is banned' }, { status: 400 });
    if (recipient.id === sender.id) return NextResponse.json({ error: 'Cannot send to yourself' }, { status: 400 });

    // Allow 0-amount message-only sends
    if (amount === 0 || amount === undefined) {
      // Just a message, no transfer
      return NextResponse.json({ success: true, message: 'Message sent', newBalance: sender.coins });
    }

    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive integer' }, { status: 400 });
    }

    const result = await transferCoins(sender.id, recipient.id, amountNum);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const updatedSender = await prisma.user.findUnique({
      where: { id: sender.id },
      select: { coins: true },
    });

    return NextResponse.json({
      success: true,
      newBalance: updatedSender?.coins ?? 0,
    });
  } catch (err) {
    console.error('[POST /api/coins/transfer]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
