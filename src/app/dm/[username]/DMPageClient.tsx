"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CoinBalance } from "@/components/CoinBalance";
import { useToast } from "@/components/ui/use-toast";

/* ─── colour tokens ─────────────────────────────────── */
const C = {
  green: "#00ff41",
  cyan: "#00f5ff",
  pink: "#ff006e",
  yellow: "#ffe600",
  red: "#ff0000",
  dimGreen: "#003b0f",
  black: "#000000",
} as const;

const glow = (c: string) => `0 0 8px ${c}, 0 0 20px ${c}`;
const boxGlow = (c: string) => `0 0 8px ${c}`;
const mono = "'Share Tech Mono', monospace";

/* ─── types ─────────────────────────────────────────── */
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

/* ─── component ─────────────────────────────────────── */
export function DMPageClient({ recipient, sender }: DMPageClientProps) {
  const [message, setMessage] = useState("");
  const [coinAmount, setCoinAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [senderCoins, setSenderCoins] = useState(sender.coins);
  const { toast } = useToast();
  const router = useRouter();

  const coinAmountNum = parseInt(coinAmount || "0", 10);
  const canAffordCoins = coinAmountNum <= senderCoins && coinAmountNum >= 0;
  const isValid = message.trim().length >= 1 || coinAmountNum > 0;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSending) return;

    setIsSending(true);
    try {
      if (coinAmountNum > 0) {
        const res = await fetch("/api/coins/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to_username: recipient.username,
            amount: coinAmountNum,
            message: message.trim() || undefined,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: "// transfer failed",
            description: data.error,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: `> sent ${coinAmountNum} coins`,
          description: `to ${recipient.display_name}.${message.trim() ? " message delivered." : ""}`,
        });
        setSenderCoins(data.newBalance);
        setMessage("");
        setCoinAmount("");
      } else if (message.trim()) {
        const res = await fetch("/api/coins/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to_username: recipient.username,
            amount: 0,
            message: message.trim(),
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: "// message failed",
            description: data.error,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "> message sent",
          description: "your message has been delivered.",
        });
        setMessage("");
      }
    } catch {
      toast({
        title: "! error",
        description: "could not send.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  /* ── label style ── */
  const labelStyle: React.CSSProperties = {
    fontFamily: mono,
    fontSize: "10px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: C.cyan,
    display: "block",
    marginBottom: "6px",
  };

  const fieldStyle: React.CSSProperties = {
    background: C.black,
    border: `1px solid ${C.dimGreen}`,
    color: C.green,
    fontFamily: mono,
    fontSize: "13px",
    padding: "10px 12px",
    outline: "none",
    borderRadius: 0,
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical" as const,
  };

  return (
    <div
      style={{
        maxWidth: "560px",
        margin: "0 auto",
        padding: "40px 16px",
        fontFamily: mono,
        background: C.black,
        minHeight: "100vh",
      }}
    >
      {/* back link */}
      <Link
        href={`/profile/${recipient.username}`}
        style={{
          color: C.dimGreen,
          fontFamily: mono,
          fontSize: "12px",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "32px",
        }}
      >
        &lt; back to profile
      </Link>

      {/* recipient header */}
      <div
        style={{
          marginBottom: "32px",
          borderBottom: `1px solid ${C.dimGreen}`,
          paddingBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "12px",
          }}
        >
          {/* avatar */}
          <div
            style={{
              width: "48px",
              height: "48px",
              border: `1px solid ${C.dimGreen}`,
              background: C.black,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: boxGlow(C.dimGreen),
            }}
          >
            {recipient.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={recipient.avatar_url}
                alt={recipient.display_name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "grayscale(30%)",
                }}
              />
            ) : (
              <span style={{ color: C.dimGreen, fontSize: "20px" }}>◈</span>
            )}
          </div>

          <div>
            <h1
              style={{
                fontFamily: mono,
                fontSize: "18px",
                color: C.pink,
                textShadow: glow(C.pink),
                margin: 0,
                textTransform: "lowercase",
              }}
            >
              {recipient.display_name}
            </h1>
            <p
              style={{
                fontFamily: mono,
                fontSize: "11px",
                color: C.dimGreen,
                margin: "2px 0 0",
              }}
            >
              @{recipient.username}
            </p>
          </div>
        </div>

        <p
          style={{
            fontFamily: mono,
            fontSize: "11px",
            color: C.dimGreen,
            margin: 0,
            lineHeight: "1.6",
          }}
        >
          // send a message and optionally transfer coins.
          <br />
          every interaction is visible in transaction logs.
        </p>
      </div>

      {/* form */}
      <form
        onSubmit={handleSend}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* message field */}
        <div>
          <label style={labelStyle}>message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="write something..."
            style={{ ...fieldStyle, minHeight: "120px" }}
            maxLength={500}
            disabled={isSending}
          />
          <div
            style={{
              fontFamily: mono,
              fontSize: "10px",
              color: C.dimGreen,
              textAlign: "right",
              marginTop: "4px",
            }}
          >
            {message.length}/500
          </div>
        </div>

        {/* coin transfer */}
        <div>
          <label style={labelStyle}>coin transfer (optional)</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                color: C.yellow,
                textShadow: glow(C.yellow),
                fontFamily: mono,
                fontSize: "16px",
                flexShrink: 0,
              }}
            >
              ¢
            </span>
            <input
              type="number"
              min="0"
              max={senderCoins}
              value={coinAmount}
              onChange={(e) => setCoinAmount(e.target.value)}
              placeholder="0"
              disabled={isSending}
              style={{ ...fieldStyle, width: "120px" }}
            />
            <span style={{ fontFamily: mono, fontSize: "11px", color: C.cyan }}>
              available: <CoinBalance balance={senderCoins} size="sm" />
            </span>
          </div>

          {/* error: not enough coins */}
          {coinAmountNum > 0 && !canAffordCoins && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "8px",
                color: C.red,
                fontFamily: mono,
                fontSize: "12px",
                textShadow: glow(C.red),
              }}
            >
              ! insufficient coins
            </div>
          )}

          {/* info: after transfer */}
          {coinAmountNum > 0 && canAffordCoins && (
            <div
              style={{
                marginTop: "8px",
                fontFamily: mono,
                fontSize: "11px",
                color: C.dimGreen,
              }}
            >
              after transfer:{" "}
              <CoinBalance balance={senderCoins - coinAmountNum} size="sm" />
            </div>
          )}
        </div>

        {/* submit */}
        <button
          type="submit"
          disabled={!isValid || !canAffordCoins || isSending}
          style={{
            fontFamily: mono,
            fontSize: "13px",
            letterSpacing: "0.1em",
            textTransform: "lowercase",
            padding: "12px 20px",
            background:
              !isValid || !canAffordCoins || isSending ? C.dimGreen : C.green,
            color: C.black,
            border: "none",
            borderRadius: 0,
            cursor:
              !isValid || !canAffordCoins || isSending
                ? "not-allowed"
                : "pointer",
            boxShadow:
              !isValid || !canAffordCoins || isSending
                ? "none"
                : boxGlow(C.green),
            textShadow: "none",
            opacity: !isValid || !canAffordCoins || isSending ? 0.4 : 1,
            width: "100%",
          }}
        >
          {isSending
            ? "> sending..."
            : coinAmountNum > 0
              ? `> send message + ¢${coinAmountNum}`
              : "> send message"}
        </button>
      </form>
    </div>
  );
}
