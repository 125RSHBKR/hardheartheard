"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { CoinBalance } from "@/components/CoinBalance";

const POST_COST_PER_CHAR = 1;

function calcPostCost(title: string, content: string): number {
  return (title.trim().length + content.trim().length) * POST_COST_PER_CHAR;
}

interface WritePageClientProps {
  userCoins: number;
  username: string;
}

export function WritePageClient({ userCoins, username }: WritePageClientProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCoins, setCurrentCoins] = useState(userCoins);
  const router = useRouter();
  const { toast } = useToast();

  const cost = calcPostCost(title, content);
  const canAfford = currentCoins >= cost;
  const isValid =
    title.trim().length >= 1 &&
    title.trim().length <= 200 &&
    content.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !canAfford || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "// transmission failed",
          description: data.error || "something went wrong.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "// published",
        description: `¢ ${data.post.coin_cost} deducted. your words are now in the void.`,
      });
      setCurrentCoins(data.newBalance);
      router.push(`/post/${data.post.id}`);
    } catch {
      toast({
        title: "error",
        description: "could not publish your post.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    background: "#000",
    color: "#00ff41",
    border: "1px solid #003b0f",
    borderRadius: "0",
    fontFamily: "'Share Tech Mono', monospace",
    caretColor: "#00ff41",
    outline: "none",
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
  };

  const focusStyle = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.currentTarget.style.borderColor = "#00ff41";
    e.currentTarget.style.boxShadow = "0 0 8px rgba(0,255,65,0.3)";
  };
  const blurStyle = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.currentTarget.style.borderColor = "#003b0f";
    e.currentTarget.style.boxShadow = "";
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 font-mono">
      {/* Back */}
      <Link
        href="/"
        className="text-xs uppercase tracking-widest mb-8 inline-block transition-all"
        style={{ color: "#003b0f" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = "#00f5ff";
          (e.currentTarget as HTMLAnchorElement).style.textShadow =
            "0 0 8px #00f5ff";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = "#003b0f";
          (e.currentTarget as HTMLAnchorElement).style.textShadow = "";
        }}
      >
        &lt; back to feed
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p
          className="text-xs uppercase tracking-widest mb-2"
          style={{
            color: "#ff006e",
            textShadow: "0 0 6px rgba(255,0,110,0.4)",
          }}
        >
          + new transmission
        </p>
        <h1
          className="text-2xl font-bold uppercase tracking-wide mb-2"
          style={{ color: "#00ff41", textShadow: "0 0 8px #00ff41" }}
        >
          spend your words.
        </h1>
        <p className="text-xs" style={{ color: "#003b0f" }}>
          publishing costs{" "}
          <span
            style={{
              color: "#ffe600",
              textShadow: "0 0 6px rgba(255,230,0,0.4)",
            }}
          >
            ¢ 1 per character
          </span>{" "}
          — make them count.
        </p>
      </div>

      {/* Insufficient coins warning */}
      {!canAfford && (
        <div
          className="mb-6 p-4"
          style={{
            border: "1px solid rgba(255,0,0,0.4)",
            background: "rgba(255,0,0,0.05)",
          }}
        >
          <p
            className="text-sm font-bold"
            style={{ color: "#ff0000", textShadow: "0 0 8px #ff0000" }}
          >
            ! insufficient coins
          </p>
          <p className="text-xs mt-1" style={{ color: "#003b0f" }}>
            you need at least ¢{cost}. current balance: {currentCoins}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label
            className="block text-xs uppercase tracking-widest"
            style={{
              color: "#00f5ff",
              textShadow: "0 0 4px rgba(0,245,255,0.4)",
            }}
          >
            &gt; title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="give your transmission a name..."
            maxLength={200}
            disabled={isSubmitting}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
          <p className="text-xs text-right" style={{ color: "#003b0f" }}>
            {title.length}/200
          </p>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label
            className="block text-xs uppercase tracking-widest"
            style={{
              color: "#00f5ff",
              textShadow: "0 0 4px rgba(0,245,255,0.4)",
            }}
          >
            &gt; content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              "pour out your soul here...\n\nline breaks\nare preserved.\nwrite your poem."
            }
            style={{ ...inputStyle, minHeight: "320px", resize: "vertical" }}
            maxLength={10000}
            disabled={isSubmitting}
            onFocus={
              focusStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>
            }
            onBlur={
              blurStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>
            }
          />
          <p
            className="text-xs text-right"
            style={{ color: content.length > 9000 ? "#ff0000" : "#003b0f" }}
          >
            {content.length}/10,000
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs">
            <span style={{ color: "#003b0f" }}>cost:</span>
            <CoinBalance balance={cost} size="sm" />
            <span style={{ color: "#003b0f" }}>balance:</span>
            <CoinBalance balance={currentCoins} size="sm" />
            <span style={{ color: "#003b0f" }}>→</span>
            <CoinBalance balance={Math.max(0, currentCoins - cost)} size="sm" />
          </div>

          <button
            type="submit"
            disabled={!isValid || !canAfford || isSubmitting}
            className="px-5 py-2 text-xs uppercase tracking-widest transition-all"
            style={{
              color: "#00ff41",
              border: "1px solid #003b0f",
              background: "#000",
              fontFamily: "'Share Tech Mono', monospace",
              cursor:
                !isValid || !canAfford || isSubmitting
                  ? "not-allowed"
                  : "pointer",
              opacity: !isValid || !canAfford || isSubmitting ? 0.4 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && isValid && canAfford) {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#00ff41";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 12px #00ff41";
                (e.currentTarget as HTMLButtonElement).style.textShadow =
                  "0 0 8px #00ff41";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#003b0f";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
              (e.currentTarget as HTMLButtonElement).style.textShadow = "";
            }}
          >
            {isSubmitting ? "// transmitting..." : `> publish (¢ ${cost})`}
          </button>
        </div>
      </form>

      <div className="vhs-line mt-10 mb-6" />
      <p className="text-xs text-center" style={{ color: "#003b0f" }}>
        once published, your words belong to the void. they cannot be unspoken.
        banned users&apos; posts remain visible, marked as{" "}
        <span style={{ color: "rgba(255,0,0,0.5)" }}>deceased</span>.
      </p>
    </div>
  );
}
