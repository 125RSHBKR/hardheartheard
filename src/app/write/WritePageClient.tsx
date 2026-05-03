'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PenLine, Coins, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { CoinBalance } from '@/components/CoinBalance';

const POST_COST = 10;

interface WritePageClientProps {
  userCoins: number;
  username: string;
}

export function WritePageClient({ userCoins, username }: WritePageClientProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCoins, setCurrentCoins] = useState(userCoins);
  const router = useRouter();
  const { toast } = useToast();

  const canAfford = currentCoins >= POST_COST;
  const isValid = title.trim().length >= 1 && title.trim().length <= 200 && content.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !canAfford || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'Failed to publish',
          description: data.error || 'Something went wrong.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Published',
        description: `10 coins deducted. Your words are now in the world.`,
      });

      setCurrentCoins(data.newBalance);
      router.push(`/post/${data.post.id}`);
    } catch {
      toast({
        title: 'Error',
        description: 'Could not publish your post.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-cream-faint hover:text-cream text-sm mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <PenLine className="h-5 w-5 text-blood" />
          <span className="text-xs uppercase tracking-widest text-blood font-sans">New Confession</span>
        </div>
        <h1 className="font-display text-3xl font-black text-cream leading-tight">
          Spend your words.
        </h1>
        <p className="font-serif text-cream-muted mt-2 italic">
          Publishing costs <span className="text-gold font-semibold not-italic">10 coins</span>. Make them count.
        </p>
      </div>

      {/* Coin warning */}
      {!canAfford && (
        <div className="mb-6 flex items-start gap-2 p-4 rounded-md bg-blood/10 border border-blood/30">
          <AlertCircle className="h-4 w-4 text-blood flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blood">Insufficient coins</p>
            <p className="text-xs text-cream-muted mt-0.5">
              You need at least 10 coins to publish. Your current balance: <CoinBalance balance={currentCoins} size="sm" />
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-xs uppercase tracking-widest text-cream-faint font-sans">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your words a name..."
            maxLength={200}
            disabled={isSubmitting}
            className="text-base"
          />
          <p className="text-xs text-cream-faint text-right">{title.length}/200</p>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label htmlFor="content" className="block text-xs uppercase tracking-widest text-cream-faint font-sans">
            Content
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Pour out your soul here...&#10;&#10;Line breaks&#10;are preserved.&#10;Write your poem."
            className="min-h-[320px] resize-y font-serif text-base leading-relaxed"
            maxLength={10000}
            disabled={isSubmitting}
          />
          <p className="text-xs text-cream-faint text-right">{content.length}/10,000</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Coins className="h-4 w-4 text-gold" />
            <span className="text-cream-muted">
              Balance: <CoinBalance balance={currentCoins} size="sm" className="inline-flex" />
            </span>
            <span className="text-cream-faint">→</span>
            <span className={canAfford ? 'text-cream-muted' : 'text-blood font-semibold'}>
              After: <CoinBalance balance={Math.max(0, currentCoins - POST_COST)} size="sm" className="inline-flex" />
            </span>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!isValid || !canAfford || isSubmitting}
            className="gap-2"
          >
            <PenLine className="h-4 w-4" />
            {isSubmitting ? 'Publishing...' : 'Publish (10 coins)'}
          </Button>
        </div>
      </form>

      {/* Disclaimer */}
      <p className="mt-8 text-xs text-cream-faint/50 text-center font-serif italic border-t border-cream/5 pt-6">
        Once published, your words belong to the void. They cannot be unspoken.
        Banned users' posts remain visible, marked as <span className="text-blood/50">DECEASED</span>.
      </p>
    </div>
  );
}
