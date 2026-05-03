'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Coins, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';
import { cn } from '@/lib/utils';

interface CommentFormProps {
  postId: string;
  userCoins: number;
  onSuccess?: (newBalance: number) => void;
  required?: boolean; // Whether the comment is required before leaving
}

const COMMENT_COST_DISPLAY = '3.48';
const COMMENT_COST_ACTUAL = 3;

export function CommentForm({ postId, userCoins, onSuccess, required = false }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const canAfford = userCoins >= COMMENT_COST_ACTUAL;
  const charCount = content.length;
  const isValid = content.trim().length >= 5 && content.trim().length <= 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !canAfford || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, content: content.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'Failed to post response',
          description: data.error || 'Something went wrong.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Response posted',
        description: `${COMMENT_COST_DISPLAY} coins deducted. Remaining: ${data.newBalance?.toLocaleString() ?? '?'}`,
        variant: 'default',
      });

      setContent('');
      onSuccess?.(data.newBalance);
      router.refresh();
    } catch {
      toast({
        title: 'Error',
        description: 'Could not submit your response.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {required && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-blood/10 border border-blood/30">
          <AlertCircle className="h-4 w-4 text-blood flex-shrink-0 mt-0.5" />
          <p className="text-xs text-cream-muted leading-relaxed">
            <span className="text-blood font-semibold">Attention is the price of entry.</span>{' '}
            You must leave a response before you can leave this page.
          </p>
        </div>
      )}

      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Leave your mark... (min. 5 characters)"
          className="min-h-[120px] resize-none font-serif text-sm pr-4"
          maxLength={1000}
          disabled={!canAfford || isSubmitting}
        />
        <span
          className={cn(
            'absolute bottom-2 right-3 text-xs',
            charCount > 900 ? 'text-blood' : 'text-cream-faint'
          )}
        >
          {charCount}/1000
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs">
          <Coins className="h-3.5 w-3.5 text-gold" />
          <span className={cn(canAfford ? 'text-cream-muted' : 'text-blood font-semibold')}>
            {canAfford ? (
              <>
                Costs <span className="text-gold font-semibold">{COMMENT_COST_DISPLAY}</span> coins
              </>
            ) : (
              'Insufficient coins — you cannot respond'
            )}
          </span>
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={!isValid || !canAfford || isSubmitting}
          className="gap-1.5"
        >
          <Send className="h-3.5 w-3.5" />
          {isSubmitting ? 'Posting...' : 'Post Response'}
        </Button>
      </div>
    </form>
  );
}
