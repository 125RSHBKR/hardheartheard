'use client';

import React, { useState } from 'react';
import { Shield, Users, FileText, MessageSquare, Coins, Skull, Ban, Gift, Trash2, Fingerprint, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminTable } from '@/components/AdminTable';
import { CoinBalance } from '@/components/CoinBalance';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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

type AdminTab = 'overview' | 'users' | 'posts' | 'transactions' | 'fingerprints';

export function AdminPageClient({ data }: AdminPageClientProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [coinTarget, setCoinTarget] = useState('');
  const [coinAmount, setCoinAmount] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAdminAction = async (action: string, payload: Record<string, unknown>) => {
    setLoading(action);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ title: 'Action failed', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'Done', description: data.message || 'Action completed.' });
        window.location.reload();
      }
    } catch {
      toast({ title: 'Error', description: 'Request failed.', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="h-4 w-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
    { id: 'posts', label: 'Posts', icon: <FileText className="h-4 w-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <Coins className="h-4 w-4" /> },
    { id: 'fingerprints', label: 'Fingerprints', icon: <Fingerprint className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Admin header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center">
          <Shield className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-black text-cream">Admin Panel</h1>
          <p className="text-xs text-cream-faint">peppendriver@gmail.com · God mode active</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-cream/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px',
              activeTab === tab.id
                ? 'text-gold border-gold'
                : 'text-cream-faint border-transparent hover:text-cream'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Users', value: data.stats.totalUsers, icon: <Users className="h-4 w-4" />, color: 'text-cream' },
              { label: 'Banned', value: data.stats.totalBanned, icon: <Skull className="h-4 w-4" />, color: 'text-blood' },
              { label: 'Total Posts', value: data.stats.totalPosts, icon: <FileText className="h-4 w-4" />, color: 'text-cream' },
              { label: 'Comments', value: data.stats.totalComments, icon: <MessageSquare className="h-4 w-4" />, color: 'text-cream' },
              { label: 'Coins in Circulation', value: data.stats.totalCoinsInCirculation.toLocaleString(), icon: <Coins className="h-4 w-4" />, color: 'text-gold' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 border border-cream/10 rounded-lg bg-ink-50">
                <div className={cn('flex items-center gap-1.5 mb-2', stat.color)}>{stat.icon}<span className="text-xs uppercase tracking-wider">{stat.label}</span></div>
                <p className={cn('text-2xl font-bold font-sans', stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Coin management */}
          <div className="p-5 border border-gold/20 rounded-lg bg-gold/5">
            <h3 className="font-display text-sm font-semibold text-gold mb-4 flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Coin Management
            </h3>
            <div className="flex items-end gap-3 flex-wrap">
              <div>
                <label className="block text-xs text-cream-faint mb-1">Username</label>
                <Input
                  value={coinTarget}
                  onChange={(e) => setCoinTarget(e.target.value)}
                  placeholder="username"
                  className="w-40"
                />
              </div>
              <div>
                <label className="block text-xs text-cream-faint mb-1">Amount</label>
                <Input
                  type="number"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  placeholder="0"
                  className="w-28"
                />
              </div>
              <Button
                size="sm"
                variant="gold"
                onClick={() => handleAdminAction('grant_coins', { username: coinTarget, amount: parseInt(coinAmount) })}
                disabled={!coinTarget || !coinAmount || loading === 'grant_coins'}
                className="gap-1.5"
              >
                <Gift className="h-3.5 w-3.5" />
                Grant
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleAdminAction('take_coins', { username: coinTarget, amount: parseInt(coinAmount) })}
                disabled={!coinTarget || !coinAmount || loading === 'take_coins'}
                className="gap-1.5"
              >
                <Ban className="h-3.5 w-3.5" />
                Take
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {activeTab === 'users' && (
        <AdminTable title="All Users" description={`${data.stats.totalUsers} total users`}>
          <AdminTable.Head>
            <AdminTable.HeadCell>User</AdminTable.HeadCell>
            <AdminTable.HeadCell>Email</AdminTable.HeadCell>
            <AdminTable.HeadCell>Coins</AdminTable.HeadCell>
            <AdminTable.HeadCell>Posts</AdminTable.HeadCell>
            <AdminTable.HeadCell>Status</AdminTable.HeadCell>
            <AdminTable.HeadCell>Actions</AdminTable.HeadCell>
          </AdminTable.Head>
          <AdminTable.Body>
            {data.users.map((user) => (
              <AdminTable.Row key={user.id} className={user.is_banned ? 'opacity-50' : ''}>
                <AdminTable.Cell>
                  <div>
                    <Link href={`/profile/${user.username}`} className="font-medium text-cream hover:text-gold text-sm">
                      {user.display_name}
                    </Link>
                    <p className="text-xs text-cream-faint">@{user.username}</p>
                  </div>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <span className="text-xs">{user.email}</span>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <CoinBalance balance={user.coins} size="sm" />
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <span className="text-xs">{user._count.posts} posts, {user._count.comments} comments</span>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  {user.is_admin && <span className="text-xs text-gold border border-gold/30 px-1.5 py-0.5 rounded mr-1">ADMIN</span>}
                  {user.is_banned ? (
                    <span className="text-xs text-blood border border-blood/30 px-1.5 py-0.5 rounded">BANNED</span>
                  ) : (
                    <span className="text-xs text-cream-faint border border-cream/20 px-1.5 py-0.5 rounded">ACTIVE</span>
                  )}
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <div className="flex items-center gap-1">
                    {!user.is_banned && !user.is_admin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => handleAdminAction('ban_user', { user_id: user.id, reason: 'Admin ban' })}
                        disabled={loading === `ban_${user.id}`}
                      >
                        <Ban className="h-3 w-3" />
                        Ban
                      </Button>
                    )}
                  </div>
                </AdminTable.Cell>
              </AdminTable.Row>
            ))}
          </AdminTable.Body>
        </AdminTable>
      )}

      {/* Posts tab */}
      {activeTab === 'posts' && (
        <AdminTable title="Recent Posts" description="Most recent 50 posts">
          <AdminTable.Head>
            <AdminTable.HeadCell>Title</AdminTable.HeadCell>
            <AdminTable.HeadCell>Author</AdminTable.HeadCell>
            <AdminTable.HeadCell>Comments</AdminTable.HeadCell>
            <AdminTable.HeadCell>Date</AdminTable.HeadCell>
            <AdminTable.HeadCell>Actions</AdminTable.HeadCell>
          </AdminTable.Head>
          <AdminTable.Body>
            {data.recentPosts.map((post) => (
              <AdminTable.Row key={post.id} className={post.is_deleted ? 'opacity-40' : ''}>
                <AdminTable.Cell>
                  <Link href={`/post/${post.id}`} className="text-sm text-cream hover:text-gold line-clamp-1">
                    {post.title}
                  </Link>
                </AdminTable.Cell>
                <AdminTable.Cell>
                  <Link href={`/profile/${post.author.username}`} className="text-xs text-cream-muted hover:text-gold">
                    @{post.author.username}
                  </Link>
                </AdminTable.Cell>
                <AdminTable.Cell className="text-xs">{post._count.comments}</AdminTable.Cell>
                <AdminTable.Cell className="text-xs">{new Date(post.created_at).toLocaleDateString()}</AdminTable.Cell>
                <AdminTable.Cell>
                  {!post.is_deleted && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => handleAdminAction('delete_post', { post_id: post.id })}
                      disabled={loading === `delete_${post.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  )}
                </AdminTable.Cell>
              </AdminTable.Row>
            ))}
          </AdminTable.Body>
        </AdminTable>
      )}

      {/* Transactions tab */}
      {activeTab === 'transactions' && (
        <AdminTable title="Recent Transactions" description="Last 100 coin transactions">
          <AdminTable.Head>
            <AdminTable.HeadCell>Type</AdminTable.HeadCell>
            <AdminTable.HeadCell>From</AdminTable.HeadCell>
            <AdminTable.HeadCell>To</AdminTable.HeadCell>
            <AdminTable.HeadCell>Amount</AdminTable.HeadCell>
            <AdminTable.HeadCell>Date</AdminTable.HeadCell>
          </AdminTable.Head>
          <AdminTable.Body>
            {data.recentTransactions.map((tx) => (
              <AdminTable.Row key={tx.id}>
                <AdminTable.Cell>
                  <span className={cn(
                    'text-xs font-mono px-1.5 py-0.5 rounded',
                    tx.type === 'TIP' ? 'bg-gold/10 text-gold' :
                    tx.type === 'PUNISHMENT' ? 'bg-blood/10 text-blood' :
                    tx.type === 'TRANSFER' ? 'bg-cream/10 text-cream' :
                    'bg-cream/5 text-cream-faint'
                  )}>
                    {tx.type}
                  </span>
                </AdminTable.Cell>
                <AdminTable.Cell className="text-xs">{tx.from_user?.username ?? '—'}</AdminTable.Cell>
                <AdminTable.Cell className="text-xs">{tx.to_user?.username ?? '—'}</AdminTable.Cell>
                <AdminTable.Cell>
                  <span className="text-xs text-gold font-semibold">{tx.amount}</span>
                </AdminTable.Cell>
                <AdminTable.Cell className="text-xs">{new Date(tx.created_at).toLocaleDateString()}</AdminTable.Cell>
              </AdminTable.Row>
            ))}
          </AdminTable.Body>
        </AdminTable>
      )}

      {/* Fingerprints tab */}
      {activeTab === 'fingerprints' && (
        <AdminTable title="Fingerprint Logs" description="Device fingerprints for multi-account detection">
          <AdminTable.Head>
            <AdminTable.HeadCell>Hash</AdminTable.HeadCell>
            <AdminTable.HeadCell>User</AdminTable.HeadCell>
            <AdminTable.HeadCell>IP</AdminTable.HeadCell>
            <AdminTable.HeadCell>User Agent</AdminTable.HeadCell>
            <AdminTable.HeadCell>Date</AdminTable.HeadCell>
          </AdminTable.Head>
          <AdminTable.Body>
            {data.fingerprintLogs.map((log) => (
              <AdminTable.Row key={log.id}>
                <AdminTable.Cell>
                  <span className="font-mono text-xs text-cream-faint truncate max-w-[120px] block">{log.fingerprint_hash.slice(0, 16)}...</span>
                </AdminTable.Cell>
                <AdminTable.Cell className="text-xs">{log.user?.username ?? 'anonymous'}</AdminTable.Cell>
                <AdminTable.Cell className="font-mono text-xs">{log.ip_address}</AdminTable.Cell>
                <AdminTable.Cell>
                  <span className="text-xs text-cream-faint truncate max-w-[200px] block">{log.user_agent.slice(0, 50)}...</span>
                </AdminTable.Cell>
                <AdminTable.Cell className="text-xs">{new Date(log.created_at).toLocaleDateString()}</AdminTable.Cell>
              </AdminTable.Row>
            ))}
          </AdminTable.Body>
        </AdminTable>
      )}
    </div>
  );
}
