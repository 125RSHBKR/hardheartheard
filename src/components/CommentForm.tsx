"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";

interface CommentFormProps {
  postId: string;
  userCoins: number;
  onSuccess?: (newBalance: number) => void;
  required?: boolean;
}

const COMMENT_COST_DISPLAY = "3.48";
const COMMENT_COST_ACTUAL = 3;

export function CommentForm({
  postId,
  userCoins,
  onSuccess,
  required = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
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
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, content: content.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "transmission failed",
          description: data.error || "something went wrong.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "// response posted",
        description: `¢ ${COMMENT_COST_DISPLAY} deducted. balance: ${data.newBalance?.toLocaleString() ?? "?"}`,
      });
      setContent("");
      onSuccess?.(data.newBalance);
      router.refresh();
    } catch {
      toast({
        title: "error",
        description: "could not submit your response.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-mono">
      {required && (
        <div
          className="p-3"
          style={{
            border: "1px solid rgba(255,0,0,0.4)",
            background: "rgba(255,0,0,0.05)",
          }}
        >
          <p
            className="text-xs"
            style={{
              color: "#ff0000",
              textShadow: "0 0 6px rgba(255,0,0,0.4)",
            }}
          >
            ! attention is the price of entry. you must respond before you can
            leave.
          </p>
        </div>
      )}

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="leave your mark... (min. 5 characters)"
          className="w-full min-h-[120px] resize-none font-mono text-sm p-3"
          style={{
            background: "#000",
            color: "#00ff41",
            border: "1px solid #003b0f",
            caretColor: "#00ff41",
            outline: "none",
          }}
          maxLength={1000}
          disabled={!canAfford || isSubmitting}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#00ff41";
            e.currentTarget.style.boxShadow = "0 0 8px rgba(0,255,65,0.3)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#003b0f";
            e.currentTarget.style.boxShadow = "";
          }}
        />
        <span
          className="absolute bottom-2 right-3 text-xs"
          style={{ color: charCount > 900 ? "#ff0000" : "#003b0f" }}
        >
          {charCount}/1000
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span
          className="text-xs"
          style={{
            color: canAfford ? "#003b0f" : "#ff0000",
            textShadow: canAfford ? "" : "0 0 6px #ff0000",
          }}
        >
          {canAfford
            ? `¢ ${COMMENT_COST_DISPLAY} cost`
            : "! insufficient coins"}
        </span>

        <button
          type="submit"
          disabled={!isValid || !canAfford || isSubmitting}
          className="px-4 py-1.5 text-xs font-mono uppercase tracking-widest transition-all"
          style={{
            color: "#00ff41",
            border: "1px solid #003b0f",
            background: "#000",
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
                "0 0 8px #00ff41";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "#003b0f";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
          }}
        >
          {isSubmitting ? "// transmitting..." : "> post response"}
        </button>
      </div>
    </form>
  );
}
