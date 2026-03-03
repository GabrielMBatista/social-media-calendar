"use client";

// Social Media Calendar Pro — ListView Component
// Design: Studio Criativo — visão de lista compacta dos posts

import { useApp } from "@/contexts/AppContext";
import { PostStatus, STATUS_CONFIG, POST_TYPE_CONFIG, DAYS_OF_WEEK } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Image, Play, Clock, LayoutGrid, Music, Youtube, Linkedin, Twitter,
  ExternalLink, ChevronRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Image, Play, Clock, LayoutGrid, Music, Youtube, Linkedin, Twitter,
};

function ListViewSkeletonRow() {
  return (
    <div className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
      <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
      <Skeleton className="h-3 w-24 border-none flex-shrink-0" />
      <Skeleton className="h-3 flex-1 border-none" />
      <Skeleton className="h-4 w-16 rounded-md flex-shrink-0 hidden sm:block" />
      <Skeleton className="h-4 w-20 rounded-md flex-shrink-0" />
    </div>
  );
}

export function ListView() {
  const { filteredPosts, getClientById, openPostModal, getWeekDates, isLoading } = useApp();
  const weekDates = getWeekDates();

  // Group posts by day
  const postsByDay = weekDates.map(({ key, date, label, isToday }) => ({
    key,
    date,
    label,
    isToday,
    posts: filteredPosts.filter(p => {
      if (p.dayOfWeek !== key) return false;
      if (p.scheduledDate) {
        const scheduled = new Date(p.scheduledDate + "T00:00:00");
        return (
          scheduled.getFullYear() === date.getFullYear() &&
          scheduled.getMonth() === date.getMonth() &&
          scheduled.getDate() === date.getDate()
        );
      }
      return true;
    }),
  }));

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {postsByDay.map(({ key, date, label, isToday, posts }) => (
        <div key={key}>
          {/* Day header */}
          <div className={cn(
            "flex items-center gap-3 mb-2 px-1",
          )}>
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg",
              isToday ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
            )}>
              <span className="text-xs font-bold">{label}</span>
              <span className="text-xs font-semibold">
                {date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
              </span>
            </div>
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">{posts.length} {posts.length === 1 ? "post" : "posts"}</span>
          </div>

          {/* Posts */}
          {isLoading ? (
            <div className="space-y-2">
              <ListViewSkeletonRow />
              <ListViewSkeletonRow />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-xs text-slate-400 italic px-4 py-2">Nenhum post neste dia</div>
          ) : (
            <div className="space-y-1.5">
              {posts.map(post => {
                const client = getClientById(post.clientId) || ({
                  id: "unknown", name: "Cliente Removido", brandColor: "#94a3b8", logoInitials: "?", logoUrl: undefined
                } as any);

                const statusCfg = STATUS_CONFIG[post.status];
                const typeCfg = POST_TYPE_CONFIG[post.type];
                const TypeIcon = ICON_MAP[typeCfg.icon] ?? Image;

                return (
                  <button
                    key={post.id}
                    onClick={() => openPostModal(post)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-all text-left group"
                    style={{ borderLeftWidth: "3px", borderLeftColor: client.brandColor }}
                  >
                    {/* Client avatar */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0"
                      style={{ backgroundColor: client.brandColor }}
                    >
                      {client.logoUrl ? (
                        <img src={client.logoUrl} alt={client.name} className="w-full h-full rounded-lg object-cover" />
                      ) : client.logoInitials}
                    </div>

                    {/* Client name */}
                    <span className="text-xs font-semibold w-20 sm:w-28 truncate flex-shrink-0" style={{ color: client.brandColor }}>
                      {client.name}
                    </span>

                    {/* Post title */}
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex-1 truncate">
                      {post.title}
                    </span>

                    {/* Type */}
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex-shrink-0">
                      <TypeIcon className={cn("size-3", typeCfg.color)} />
                      {typeCfg.label}
                    </span>

                    {/* Status */}
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-semibold flex-shrink-0",
                      statusCfg.bg, statusCfg.color
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", statusCfg.dot)} />
                      {statusCfg.label}
                    </span>

                    {/* Time */}
                    {post.scheduledTime && (
                      <span className="hidden md:flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                        <Clock size={10} />
                        {post.scheduledTime}
                      </span>
                    )}

                    {/* Drive link */}
                    {post.driveLink && (
                      <ExternalLink size={12} className="text-slate-300 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                    )}

                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
