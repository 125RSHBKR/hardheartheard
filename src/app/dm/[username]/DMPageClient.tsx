'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Coins, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CoinBalance } from '@/components/CoinBalance';
import { useToast } from '@/components/ui/use-toast';

interface DMPageClientProps {
  recipient: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  sender: {
    id: string;
    username: string;
    coins: number;
  };
}

export function DMPageClient({ recipient, sender }: DMPageClientProps) {
  const [message, setMessage] = useState('');
  const [coinAmount, setCoinAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [senderCoins, setSenderCoins] = useState(sender.coins);
  const { toast } = useToast();
  const router = useRouter();

  const coinAmountNum = parseInt(coinAmount || '0', 10);
  const canAffordCoins = coinAmountNum <= senderCoins && coinAmountNum >= 0;
  const isValid = message.trim().length >= 1 || coinAmountNum > 0;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSending) return;

    setIsSending(true);
    try {
      // Send coin transfer if amount > 0
      if (coinAmountNum > 0) {
        const res = await fetch('/api/coins/transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_username: recipient.username,
            amount: coinAmountNum,
            message: message.trim() || undefined,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          toast({ title: 'Transfer failed', description: data.error, variant: 'destructive' });
          return;
        }

        toast({
          title: `Sent ${coinAmountNum} coins`,
          description: `To ${recipient.display_name}. ${message.trim() ? 'Message delivered.' : ''}`,
        });
        setSenderCoins(data.newBalance);
        setMessage('');
        setCoinAmount('');
      } else if (message.trim()) {
        // Pure message (no coin transfer) — still uses coin transfer API with 0 amount
        const res = await fetch('/api/coins/transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_username: recipient.username,
            amount: 0,
            message: message.trim(),
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          toast({ title: 'Message failed', description: data.error, variant: 'destructive' });
          return;
        }

        toast({ title: 'Message sent', description: `Your message has been delivered.` });
        setMessage('');
      }
    } catch {
      toast({ title: 'Error', description: 'Could not send.', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <Link href={`/profile/${recipient.username}`} className="inline-flex items-center gap-1.5 text-cream-faint hover:text-cream text-sm mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to profile
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-ink-50 border border-cream/20 flex items-center justify-center overflow-hidden">
            {recipient.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={recipient.avatar_url} alt={recipient.display_name} className="h-full w-full object-cover" />
            ) : (
              <div className="text-xl">👤</div>
            )}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-cream">{recipient.display_name}</h1>
            <p className="text-xs text-cream-faint">@{recipient.username}</p>
          </div>
        </div>
        <p className="font-serif text-sm text-cream-muted italic">
          Send a message and optionally transfer coins. Every interaction here is visible in transaction logs.
        </p>
      </div>

      <form onSubmit={handleSend} className="space-y-5">
        {/* Message */}
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-widest text-cream-faint font-sans">
            Message (optional)
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write something..."
            className="min-h-[120px] font-serif text-sm resize-none"
            maxLength={500}
            disabled={isSending}
          />
          <p className="text-xs text-cream-faint text-right">{message.length}/500</p>
        </div>

        {/* Coin transfer */}
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-widest text-cream-faint font-sans">
            Coin Transfer (optional)
          </label>
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-gold flex-shrink-0" />
            <Input
              type="number"
              min="0"
              max={senderCoins}
              value={coinAmount}
              onChange={(e) => setCoinAmount(e.target.value)}
              placeholder="0"
              className="w-32"
              disabled={isSending}
            />
            <span className="text-xs text-cream-faint">
              Available: <CoinBalance balance={senderCoins} size="sm" />
            </span>
          </div>
          {coinAmountNum > 0 && !canAffordCoins && (
            <div className="flex items-center gap-1.5 text-xs text-blood">
              <AlertCircle className="h-3.5 w-3.5" />
              Insufficient coins
            </div>
          )}
          {coinAmountNum > 0 && canAffordCoins && (
            <p className="text-xs text-cream-faint">
              After transfer: <CoinBalance balance={senderCoins - coinAmountNum} size="sm" />
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={!isValid || !canAffordCoins || isSending}
          className="w-full gap-2"
        >
          <Send className="h-4 w-4" />
          {isSending ? 'Sending...' : coinAmountNum > 0 ? `Send Message + ${coinAmountNum} Coins` : 'Send Message'}
        </Button>
      </form>
    </div>
  );
}
