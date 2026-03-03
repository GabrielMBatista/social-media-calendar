// Social Media Calendar Pro — Types & Data Structures
// Design: Studio Criativo — identidade visual do cliente como protagonista

export type PostStatus = "pronto" | "em_producao" | "rascunho" | "publicado" | "cancelado";

export type PostType =
  | "feed"
  | "reels"
  | "stories"
  | "carrossel"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "twitter";

export type DayOfWeek = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

// --- Multi-Tenant Foundation ---
export interface Account {
  id: string;
  name: string;
  plan: "free" | "pro";
  createdAt: string;
}

export interface User {
  id: string;
  accountId: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member";
}

// --- Domain Entities ---
export interface Client {
  id: string;
  accountId: string;          // Proteção Multi-Tenant
  name: string;
  brandColor: string;
  brandColorSecondary?: string;
  logoUrl?: string;
  logoInitials: string;
  industry?: string;
  instagramHandle?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Post {
  id: string;
  accountId: string;          // Proteção Multi-Tenant
  clientId: string;
  title: string;
  description: string;
  type: PostType;
  status: PostStatus;
  dayOfWeek: DayOfWeek;
  scheduledDate?: string;     // ISO date string
  scheduledTime?: string;     // HH:MM
  driveLink?: string;
  caption?: string;
  hashtags?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateClientDTO = Omit<Client, "id" | "accountId" | "createdAt" | "updatedAt">;
export type CreatePostDTO = Omit<Post, "id" | "accountId" | "createdAt" | "updatedAt">;

export interface WeekData {
  weekStart: string;  // ISO date string (Monday)
  weekEnd: string;    // ISO date string (Sunday)
  posts: Post[];
}

export const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; bg: string; dot: string; ring: string }> = {
  pronto: {
    label: "Pronto",
    color: "text-emerald-700 dark:text-emerald-200",
    bg: "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30",
    dot: "bg-emerald-500 dark:bg-emerald-400",
    ring: "ring-emerald-500 dark:ring-emerald-400",
  },
  em_producao: {
    label: "Em Produção",
    color: "text-amber-700 dark:text-amber-200",
    bg: "bg-amber-50 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/30",
    dot: "bg-amber-500 dark:bg-amber-400",
    ring: "ring-amber-500 dark:ring-amber-400",
  },
  rascunho: {
    label: "Rascunho",
    color: "text-purple-700 dark:text-purple-200",
    bg: "bg-purple-50 dark:bg-purple-500/20 border-purple-200 dark:border-purple-500/30",
    dot: "bg-purple-500 dark:bg-purple-400",
    ring: "ring-purple-500 dark:ring-purple-400",
  },
  publicado: {
    label: "Publicado",
    color: "text-blue-700 dark:text-blue-200",
    bg: "bg-blue-50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30",
    dot: "bg-blue-500 dark:bg-blue-400",
    ring: "ring-blue-500 dark:ring-blue-400",
  },
  cancelado: {
    label: "Cancelado",
    color: "text-red-700 dark:text-red-200",
    bg: "bg-red-50 dark:bg-red-500/20 border-red-200 dark:border-red-500/30",
    dot: "bg-red-500 dark:bg-red-400",
    ring: "ring-red-500 dark:ring-red-400",
  },
};

export const POST_TYPE_CONFIG: Record<PostType, { label: string; icon: string; color: string }> = {
  feed: { label: "Feed", icon: "Image", color: "text-violet-600 dark:text-violet-400" },
  reels: { label: "Reels", icon: "Play", color: "text-pink-600 dark:text-pink-400" },
  stories: { label: "Stories", icon: "Clock", color: "text-orange-500 dark:text-orange-400" },
  carrossel: { label: "Carrossel", icon: "LayoutGrid", color: "text-blue-600 dark:text-blue-400" },
  tiktok: { label: "TikTok", icon: "Music", color: "text-slate-800 dark:text-slate-300" },
  youtube: { label: "YouTube", icon: "Youtube", color: "text-red-600 dark:text-red-400" },
  linkedin: { label: "LinkedIn", icon: "Linkedin", color: "text-blue-700 dark:text-blue-400" },
  twitter: { label: "Twitter/X", icon: "Twitter", color: "text-sky-500 dark:text-sky-400" },
};

export const DAYS_OF_WEEK: { key: DayOfWeek; label: string; short: string }[] = [
  { key: "seg", label: "Segunda", short: "Seg" },
  { key: "ter", label: "Terça", short: "Ter" },
  { key: "qua", label: "Quarta", short: "Qua" },
  { key: "qui", label: "Quinta", short: "Qui" },
  { key: "sex", label: "Sexta", short: "Sex" },
  { key: "sab", label: "Sábado", short: "Sáb" },
  { key: "dom", label: "Domingo", short: "Dom" },
];
