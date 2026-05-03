import { TransactionType } from ".prisma/client";

export interface UserLink {
  label: string;
  url: string;
}

export interface AppUser {
  id: string;
  email: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  links: UserLink[];
  coins: number;
  is_banned: boolean;
  ban_reason: string | null;
  banned_at: Date | null;
  is_admin: boolean;
  fingerprint_hash: string | null;
  ip_history: string[];
  created_at: Date;
  updated_at: Date;
}

export interface AppPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  coin_cost: number;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  author?: AppUser;
  comments?: AppComment[];
  _count?: { comments: number };
}

export interface AppComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  coin_cost: number;
  coins_received: number;
  coins_lost: number;
  is_spam_flagged: boolean;
  spam_flag_count: number;
  is_deleted: boolean;
  created_at: Date;
  author?: AppUser;
}

export interface AppCoinTransaction {
  id: string;
  from_user_id: string | null;
  to_user_id: string | null;
  amount: number;
  type: TransactionType;
  reference_id: string | null;
  created_at: Date;
  from_user?: AppUser;
  to_user?: AppUser;
}

export interface AppHallOfShame {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  banned_at: Date;
  reason: string;
  final_coin_balance: number;
  created_at: Date;
}

export interface AppFingerprintLog {
  id: string;
  fingerprint_hash: string;
  user_id: string | null;
  ip_address: string;
  user_agent: string;
  created_at: Date;
  user?: AppUser;
}

export type FeedPost = AppPost & {
  author: Pick<
    AppUser,
    "id" | "username" | "display_name" | "avatar_url" | "is_banned"
  >;
  _count: { comments: number };
};

export type PostWithComments = AppPost & {
  author: Pick<
    AppUser,
    "id" | "username" | "display_name" | "avatar_url" | "is_banned"
  >;
  comments: (AppComment & {
    author: Pick<
      AppUser,
      "id" | "username" | "display_name" | "avatar_url" | "is_banned"
    >;
  })[];
};

export interface AdminStats {
  totalUsers: number;
  totalBanned: number;
  totalPosts: number;
  totalComments: number;
  totalCoinsInCirculation: number;
}
