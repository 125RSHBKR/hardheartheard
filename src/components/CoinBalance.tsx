'use client';

import React, { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoinBalanceProps {
  balance: number;
  className?: string;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CoinBalance({ balance, className, animated = true, size = 'md' }: CoinBalanceProps) {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (balance !== displayBalance) {
      setIsChanging(true);
      const timer = setTimeout(() => {
        setDisplayBalance(balance);
        setIsChanging(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [balance, displayBalance]);

  const danger = balance < 100;
  const warning = balance < 500 && !danger;

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold font-sans transition-all duration-300',
        sizeClasses[size],
        danger ? 'text-blood animate-flicker' : warning ? 'text-gold-light' : 'text-gold',
        animated && isChanging && 'scale-110',
        className
      )}
      title={`${balance.toLocaleString()} coins`}
    >
      <Coins className={cn(iconSizes[size], animated && 'animate-coin-pulse')} />
      <span>{displayBalance.toLocaleString()}</span>
    </span>
  );
}
