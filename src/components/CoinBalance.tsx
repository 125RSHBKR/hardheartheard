"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CoinBalanceProps {
  balance: number;
  className?: string;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CoinBalance({
  balance,
  className,
  animated = true,
  size = "md",
}: CoinBalanceProps) {
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

  const danger = balance < 50;
  const warning = balance < 100 && !danger;

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const color = danger ? "#ff0000" : warning ? "#ff006e" : "#ffe600";
  const glow = danger
    ? "0 0 8px #ff0000, 0 0 20px #ff0000, 0 0 40px rgba(255,0,0,0.5)"
    : warning
      ? "0 0 8px #ff006e, 0 0 16px rgba(255,0,110,0.4)"
      : "0 0 8px #ffe600, 0 0 16px rgba(255,230,0,0.3)";

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-semibold transition-all duration-300",
        sizeClasses[size],
        animated && isChanging && "scale-110",
        danger && "animate-flicker",
        warning && "animate-glow-pulse",
        className,
      )}
      style={{ color, textShadow: glow }}
      title={`${balance.toLocaleString()} coins`}
    >
      ¢&nbsp;{displayBalance.toLocaleString()}
    </span>
  );
}
