"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";

export default function WelcomePage() {
  const supabase = createClient();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center font-mono px-4 py-16">
      <div className="max-w-xl w-full space-y-10">

        {/* Epigraph */}
        <div>
          <p
            className="text-xs italic leading-relaxed"
            style={{ color: "var(--c-muted)" }}
          >
            &ldquo;The saints may shine down on you&rdquo;
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--c-muted)" }}
          >
            &mdash; Morrissey, approximately
          </p>
        </div>

        {/* VHS divider */}
        <div className="vhs-line" />

        {/* Welcome letter */}
        <div className="space-y-5 text-sm leading-relaxed" style={{ color: "var(--c-fg)" }}>
          <p>Hi,</p>
          <p>
            Welcome to{" "}
            <span
              style={{
                color: "#00ff41",
                textShadow: "0 0 8px #00ff41, 0 0 20px rgba(0,255,65,0.4)",
                fontWeight: "bold",
                letterSpacing: "0.15em",
              }}
            >
              HEAVEN.
            </span>
          </p>
          <p>
            please write your heart as real as it gets.
            <br />
            there is no shame in honesty. here.
            <br />
            enjoy your style, play around, be free and yourself.
          </p>
          <p style={{ color: "var(--c-muted)" }}>
            you might have thought nobody cares about you.
            <br />
            but I do.
          </p>
          <p>
            I&apos;m{" "}
            <span
              style={{
                color: "#00f5ff",
                textShadow: "0 0 6px #00f5ff",
              }}
            >
              peppendriver
            </span>
            , and my name is{" "}
            <span style={{ color: "#ffe600", textShadow: "0 0 6px rgba(255,230,0,0.5)" }}>
              Justin Reichert
            </span>
            .
            <br />
            You can call me Justin or just peppen.
          </p>
          <p>
            Your writings are appreciated and will be read.
            <br />
            <span style={{ color: "var(--c-muted)" }}>
              And whatever you might scramble out of this &mdash; I will respond.
            </span>
          </p>
          <p
            style={{
              color: "#ff006e",
              textShadow: "0 0 8px rgba(255,0,110,0.5)",
            }}
          >
            here is precious, and you are here.
          </p>
          <p style={{ color: "var(--c-muted)" }}>
            Enjoy your play,
            <br />
            have an awesome life in touch.
          </p>
        </div>

        {/* VHS divider */}
        <div className="vhs-line" />

        {/* Sign in */}
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--c-muted)" }}>
            &gt; sign in to enter
          </p>
          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 text-sm uppercase tracking-widest transition-all"
            style={{
              color: "#00ff41",
              border: "1px solid #00ff41",
              background: "#000",
              boxShadow: "0 0 10px rgba(0,255,65,0.25)",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 20px #00ff41, inset 0 0 12px rgba(0,255,65,0.08)";
              e.currentTarget.style.textShadow = "0 0 10px #00ff41";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 10px rgba(0,255,65,0.25)";
              e.currentTarget.style.textShadow = "";
            }}
          >
            {/* Google G icon */}
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#00ff41" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
            </svg>
            [ continue with google ]
          </button>
          <p className="text-xs text-center" style={{ color: "var(--c-muted)" }}>
            you start with{" "}
            <span style={{ color: "#ffe600", textShadow: "0 0 6px rgba(255,230,0,0.4)" }}>
              ¢ 10,000
            </span>
            {" "}— spend them on words.
          </p>
        </div>

      </div>
    </div>
  );
}
