"use client";

import React, { useState } from "react";
import { AdminTable } from "@/components/AdminTable";
import { CoinBalance } from "@/components/CoinBalance";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

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

/* ─── shared style helpers ──────────────────────────── */
const panelStyle: React.CSSProperties = {
  background: C.black,
  border: `1px solid ${C.dimGreen}`,
  fontFamily: mono,
  padding: "16px",
  marginBottom: "16px",
};

const labelStyle: React.CSSProperties = {
  fontFamily: mono,
  fontSize: "10px",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: C.cyan,
  display: "block",
  marginBottom: "4px",
};

const inputStyle: React.CSSProperties = {
  background: C.black,
  border: `1px solid ${C.dimGreen}`,
  color: C.green,
  fontFamily: mono,
  fontSize: "13px",
  padding: "6px 10px",
  outline: "none",
  borderRadius: 0,
  width: "100%",
  boxSizing: "border-box",
};

const btnBase: React.CSSProperties = {
  fontFamily: mono,
  fontSize: "12px",
  padding: "6px 14px",
  border: "none",
  borderRadius: 0,
  cursor: "pointer",
  textTransform: "lowercase",
  letterSpacing: "0.1em",
};

/* ─── types ─────────────────────────────────────────── */
interface AdminData {
  stats: {
    totalUsers: number;
    totalBanned: number;
    totalPosts: number;
    totalComments: number;
    totalCoinsInCirculation: number;
  };
  users: Array<{
    id: string;
    username: string;
    display_name: string;
    email: string;
    coins: number;
    is_banned: boolean;
    is_admin: boolean;
    created_at: Date;
    fingerprint_hash: string | null;
    ip_history: string[];
    _count: { posts: number; comments: number };
  }>;
  recentPosts: Array<{
    id: string;
    title: string;
    is_deleted: boolean;
    created_at: Date;
    author: { username: string; display_name: string };
    _count: { comments: number };
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    created_at: Date;
    from_user: { username: string } | null;
    to_user: { username: string } | null;
  }>;
  fingerprintLogs: Array<{
    id: string;
    fingerprint_hash: string;
    ip_address: string;
    user_agent: string;
    created_at: Date;
    user: { username: string } | null;
  }>;
}

interface AdminPageClientProps {
  data: AdminData;
}

type AdminTab =
  | "overview"
  | "users"
  | "posts"
  | "transactions"
  | "fingerprints";

/* ─── component ─────────────────────────────────────── */
export function AdminPageClient({ data }: AdminPageClientProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [coinTarget, setCoinTarget] = useState("");
  const [coinAmount, setCoinAmount] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAdminAction = async (
    action: string,
    payload: Record<string, unknown>,
  ) => {
    setLoading(action);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const resData = await res.json();
      if (!res.ok) {
        toast({
          title: "// action failed",
          description: resData.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "> done",
          description: resData.message || "action completed.",
        });
        window.location.reload();
      }
    } catch {
      toast({
        title: "! error",
        description: "request failed.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const tabs: { id: AdminTab; label: string; symbol: string }[] = [
    { id: "overview", label: "overview", symbol: "◈" },
    { id: "users", label: "users", symbol: ">" },
    { id: "posts", label: "posts", symbol: "//" },
    { id: "transactions", label: "transactions", symbol: "¢" },
    { id: "fingerprints", label: "fingerprints", symbol: "⚑" },
  ];

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "32px 16px",
        fontFamily: mono,
        background: C.black,
        minHeight: "100vh",
      }}
    >
      {/* ── header ── */}
      <div
        style={{
          marginBottom: "32px",
          borderBottom: `1px solid ${C.dimGreen}`,
          paddingBottom: "16px",
        }}
      >
        <h1
          style={{
            fontFamily: mono,
            fontSize: "22px",
            color: C.green,
            textShadow: glow(C.green),
            textTransform: "lowercase",
            margin: 0,
          }}
        >
          ◈ admin panel
        </h1>
        <p
          style={{
            fontFamily: mono,
            fontSize: "11px",
            color: C.cyan,
            marginTop: "4px",
            textShadow: glow(C.cyan),
          }}
        >
          peppendriver@gmail.com · god mode active
        </p>
      </div>

      {/* ── tabs ── */}
      <div
        style={{
          display: "flex",
          gap: "2px",
          marginBottom: "28px",
          borderBottom: `1px solid ${C.dimGreen}`,
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...btnBase,
                padding: "8px 18px",
                background: active ? C.dimGreen : "transparent",
                color: active ? C.green : C.dimGreen,
                textShadow: active ? glow(C.green) : "none",
                borderBottom: active
                  ? `2px solid ${C.green}`
                  : "2px solid transparent",
                boxShadow: active ? boxGlow(C.green) : "none",
                whiteSpace: "nowrap",
                marginBottom: "-1px",
              }}
            >
              {tab.symbol} {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══ overview tab ══ */}
      {activeTab === "overview" && (
        <div>
          {/* stats grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            {[
              {
                label: "total users",
                value: data.stats.totalUsers,
                color: C.green,
              },
              {
                label: "☠ banned",
                value: data.stats.totalBanned,
                color: C.red,
              },
              {
                label: "// posts",
                value: data.stats.totalPosts,
                color: C.green,
              },
              {
                label: "> comments",
                value: data.stats.totalComments,
                color: C.cyan,
              },
              {
                label: "¢ in circulation",
                value: data.stats.totalCoinsInCirculation.toLocaleString(),
                color: C.yellow,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  ...panelStyle,
                  margin: 0,
                  boxShadow: boxGlow(stat.color),
                  borderColor: stat.color === C.green ? C.dimGreen : stat.color,
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: C.cyan,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: "26px",
                    color: stat.color,
                    textShadow: glow(stat.color),
                    fontFamily: mono,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* coin management */}
          <div
            style={{
              ...panelStyle,
              borderColor: C.yellow,
              boxShadow: boxGlow(C.yellow),
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: C.yellow,
                textShadow: glow(C.yellow),
                marginBottom: "16px",
                letterSpacing: "0.1em",
              }}
            >
              ¢ coin management
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "flex-end",
              }}
            >
              <div style={{ flex: "0 0 160px" }}>
                <label style={labelStyle}>username</label>
                <input
                  style={inputStyle}
                  value={coinTarget}
                  onChange={(e) => setCoinTarget(e.target.value)}
                  placeholder="username"
                />
              </div>
              <div style={{ flex: "0 0 110px" }}>
                <label style={labelStyle}>amount</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <button
                style={{
                  ...btnBase,
                  background: C.yellow,
                  color: C.black,
                  boxShadow: boxGlow(C.yellow),
                  opacity:
                    !coinTarget || !coinAmount || loading === "grant_coins"
                      ? 0.4
                      : 1,
                }}
                disabled={
                  !coinTarget || !coinAmount || loading === "grant_coins"
                }
                onClick={() =>
                  handleAdminAction("grant_coins", {
                    username: coinTarget,
                    amount: parseInt(coinAmount),
                  })
                }
              >
                + grant
              </button>
              <button
                style={{
                  ...btnBase,
                  background: C.red,
                  color: C.black,
                  boxShadow: boxGlow(C.red),
                  opacity:
                    !coinTarget || !coinAmount || loading === "take_coins"
                      ? 0.4
                      : 1,
                }}
                disabled={
                  !coinTarget || !coinAmount || loading === "take_coins"
                }
                onClick={() =>
                  handleAdminAction("take_coins", {
                    username: coinTarget,
                    amount: parseInt(coinAmount),
                  })
                }
              >
                - take
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ users tab ══ */}
      {activeTab === "users" && (
        <AdminTable
          title={`> users`}
          description={`${data.stats.totalUsers} total users`}
        >
          <AdminTable.Head>
            <AdminTable.HeadCell>user</AdminTable.HeadCell>
            <AdminTable.HeadCell>email</AdminTable.HeadCell>
            <AdminTable.HeadCell>coins</AdminTable.HeadCell>
            <AdminTable.HeadCell>posts</AdminTable.HeadCell>
            <AdminTable.HeadCell>status</AdminTable.HeadCell>
            <AdminTable.HeadCell>actions</AdminTable.HeadCell>
          </AdminTable.Head>
          <AdminTable.Body>
            {data.users.map((user) => (
              <AdminTable.Row
                key={user.id}
                style={user.is_banned ? { opacity: 0.45 } : {}}
              >
                <AdminTable.Cell>
                  <div>
                    <Link
                      href={`/profile/${user.username}`}
                      style={{
                        color: C.pink,
                        textShadow: glow(C.pink),
                        fontFamily: mono,
                        fontSize: "13px",
                        textDecoration: "none",
                      }}
                    >
                      {user.display_name}
                    </Link>
                    <div
                      style={{
                        fontSize: "11px",
                        color: C.dimGreen,
                        fontFamily: mono,
                      }}
                    >
                      @{user.username}
                    </div>
                  </div>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <span
                    style={{
                      fontSize: "11px",
                      color: C.cyan,
                      fontFamily: mono,
                    }}
                  >
                    {user.email}
                  </span>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <CoinBalance balance={user.coins} size="sm" />
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <span
                    style={{
                      fontSize: "11px",
                      color: C.cyan,
                      fontFamily: mono,
                    }}
                  >
                    {user._count.posts} posts · {user._count.comments} comments
                  </span>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <div
                    style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}
                  >
                    {user.is_admin && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: C.yellow,
                          border: `1px solid ${C.yellow}`,
                          padding: "1px 6px",
                          fontFamily: mono,
                          letterSpacing: "0.1em",
                        }}
                      >
                        ADMIN
                      </span>
                    )}
                    {user.is_banned ? (
                      <span
                        style={{
                          fontSize: "10px",
                          color: C.red,
                          border: `1px solid ${C.red}`,
                          padding: "1px 6px",
                          fontFamily: mono,
                          letterSpacing: "0.1em",
                        }}
                      >
                        ☠ BANNED
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "10px",
                          color: C.dimGreen,
                          border: `1px solid ${C.dimGreen}`,
                          padding: "1px 6px",
                          fontFamily: mono,
                          letterSpacing: "0.1em",
                        }}
                      >
                        ACTIVE
                      </span>
                    )}
                  </div>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  {!user.is_banned && !user.is_admin && (
                    <button
                      style={{
                        ...btnBase,
                        padding: "4px 10px",
                        background: C.red,
                        color: C.black,
                        fontSize: "11px",
                        boxShadow: boxGlow(C.red),
                        opacity: loading === `ban_${user.id}` ? 0.5 : 1,
                      }}
                      disabled={loading === `ban_${user.id}`}
                      onClick={() =>
                        handleAdminAction("ban_user", {
                          user_id: user.id,
                          reason: "Admin ban",
                        })
                      }
                    >
                      ☠ ban
                    </button>
                  )}
                </AdminTable.Cell>
              </AdminTable.Row>
            ))}
          </AdminTable.Body>
        </AdminTable>
      )}

      {/* ══ posts tab ══ */}
      {activeTab === "posts" && (
        <AdminTable title="// posts" description="most recent 50 posts">
          <AdminTable.Head>
            <AdminTable.HeadCell>title</AdminTable.HeadCell>
            <AdminTable.HeadCell>author</AdminTable.HeadCell>
            <AdminTable.HeadCell>comments</AdminTable.HeadCell>
            <AdminTable.HeadCell>date</AdminTable.HeadCell>
            <AdminTable.HeadCell>actions</AdminTable.HeadCell>
          </AdminTable.Head>
          <AdminTable.Body>
            {data.recentPosts.map((post) => (
              <AdminTable.Row
                key={post.id}
                style={post.is_deleted ? { opacity: 0.35 } : {}}
              >
                <AdminTable.Cell>
                  <Link
                    href={`/post/${post.id}`}
                    style={{
                      color: C.green,
                      fontFamily: mono,
                      fontSize: "13px",
                      textDecoration: "none",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "300px",
                    }}
                  >
                    {post.title}
                  </Link>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <Link
                    href={`/profile/${post.author.username}`}
                    style={{
                      color: C.pink,
                      fontSize: "12px",
                      fontFamily: mono,
                      textDecoration: "none",
                    }}
                  >
                    @{post.author.username}
                  </Link>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <span
                    style={{
                      fontSize: "12px",
                      color: C.cyan,
                      fontFamily: mono,
                    }}
                  >
                    {post._count.comments}
                  </span>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <span
                    style={{
                      fontSize: "11px",
                      color: C.dimGreen,
                      fontFamily: mono,
                    }}
                  >
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  {!post.is_deleted && (
                    <button
                      style={{
                        ...btnBase,
                        padding: "4px 10px",
                        background: C.red,
                        color: C.black,
                        fontSize: "11px",
                        boxShadow: boxGlow(C.red),
                        opacity: loading === `delete_${post.id}` ? 0.5 : 1,
                      }}
                      disabled={loading === `delete_${post.id}`}
                      onClick={() =>
                        handleAdminAction("delete_post", { post_id: post.id })
                      }
                    >
                      ! delete
                    </button>
                  )}
                </AdminTable.Cell>
              </AdminTable.Row>
            ))}
          </AdminTable.Body>
        </AdminTable>
      )}

      {/* ══ transactions tab ══ */}
      {activeTab === "transactions" && (
        <AdminTable
          title="¢ transactions"
          description="last 100 coin transactions"
        >
          <AdminTable.Head>
            <AdminTable.HeadCell>type</AdminTable.HeadCell>
            <AdminTable.HeadCell>from</AdminTable.HeadCell>
            <AdminTable.HeadCell>to</AdminTable.HeadCell>
            <AdminTable.HeadCell>amount</AdminTable.HeadCell>
            <AdminTable.HeadCell>date</AdminTable.HeadCell>
          </AdminTable.Head>
          <AdminTable.Body>
            {data.recentTransactions.map((tx) => {
              const typeColor =
                tx.type === "TIP"
                  ? C.yellow
                  : tx.type === "PUNISHMENT"
                    ? C.red
                    : tx.type === "TRANSFER"
                      ? C.cyan
                      : C.dimGreen;
              return (
                <AdminTable.Row key={tx.id}>
                  <AdminTable.Cell>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: "11px",
                        color: typeColor,
                        border: `1px solid ${typeColor}`,
                        padding: "1px 6px",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {tx.type}
                    </span>
                  </AdminTable.Cell>
                  <AdminTable.Cell>
                    <span
                      style={{
                        fontSize: "12px",
                        color: C.pink,
                        fontFamily: mono,
                      }}
                    >
                      {tx.from_user?.username ?? "—"}
                    </span>
                  </AdminTable.Cell>
                  <AdminTable.Cell>
                    <span
                      style={{
                        fontSize: "12px",
                        color: C.pink,
                        fontFamily: mono,
                      }}
                    >
                      {tx.to_user?.username ?? "—"}
                    </span>
                  </AdminTable.Cell>
                  <AdminTable.Cell>
                    <span
                      style={{
                        fontSize: "13px",
                        color: C.yellow,
                        textShadow: glow(C.yellow),
                        fontFamily: mono,
                      }}
                    >
                      ¢{tx.amount}
                    </span>
                  </AdminTable.Cell>
                  <AdminTable.Cell>
                    <span
                      style={{
                        fontSize: "11px",
                        color: C.dimGreen,
                        fontFamily: mono,
                      }}
                    >
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </AdminTable.Cell>
                </AdminTable.Row>
              );
            })}
          </AdminTable.Body>
        </AdminTable>
      )}

      {/* ══ fingerprints tab ══ */}
      {activeTab === "fingerprints" && (
        <AdminTable
          title="⚑ fingerprints"
          description="device fingerprints for multi-account detection"
        >
          <AdminTable.Head>
            <AdminTable.HeadCell>hash</AdminTable.HeadCell>
            <AdminTable.HeadCell>user</AdminTable.HeadCell>
            <AdminTable.HeadCell>ip</AdminTable.HeadCell>
            <AdminTable.HeadCell>user agent</AdminTable.HeadCell>
            <AdminTable.HeadCell>date</AdminTable.HeadCell>
          </AdminTable.Head>
          <AdminTable.Body>
            {data.fingerprintLogs.map((log) => (
              <AdminTable.Row key={log.id}>
                <AdminTable.Cell>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: "11px",
                      color: C.dimGreen,
                      display: "block",
                      maxWidth: "130px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {log.fingerprint_hash.slice(0, 16)}…
                  </span>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <span
                    style={{
                      fontSize: "12px",
                      color: C.pink,
                      fontFamily: mono,
                    }}
                  >
                    {log.user?.username ?? "anonymous"}
                  </span>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: "12px",
                      color: C.cyan,
                    }}
                  >
                    {log.ip_address}
                  </span>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <span
                    style={{
                      fontSize: "11px",
                      color: C.dimGreen,
                      fontFamily: mono,
                      display: "block",
                      maxWidth: "220px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {log.user_agent.slice(0, 50)}…
                  </span>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <span
                    style={{
                      fontSize: "11px",
                      color: C.dimGreen,
                      fontFamily: mono,
                    }}
                  >
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </AdminTable.Cell>
              </AdminTable.Row>
            ))}
          </AdminTable.Body>
        </AdminTable>
      )}
    </div>
  );
}
