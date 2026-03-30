"use client";

// Social Media Calendar Pro — PostCard Component
// Design: Studio Criativo — card compacto com identidade visual do cliente

import React from "react";
import { Post, Client, PostStatus, SocialTheme, STATUS_CONFIG, POST_TYPE_CONFIG, SOCIAL_THEME_CONFIG } from "@/lib/types";
import { useApp } from "@/contexts/AppContext";
import {
  Image, Play, Clock, LayoutGrid, Music, Youtube, Linkedin, Twitter,
  ExternalLink, ChevronDown, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Image, Play, Clock, LayoutGrid, Music, Youtube, Linkedin, Twitter,
};

const STATUS_ORDER: PostStatus[] = ["rascunho", "em_producao", "pronto", "publicado", "cancelado"];

interface PostCardProps {
  post: Post;
  client: Client;
}

export const PostCard = React.memo(function PostCard({ post, client }: PostCardProps) {
  const { openPostModal, updatePostStatus } = useApp();
  const statusCfg = STATUS_CONFIG[post.status];
  const typeCfg = POST_TYPE_CONFIG[post.type];
  const TypeIcon = ICON_MAP[typeCfg.icon] ?? Image;

  const handleStatusChange = (e: React.MouseEvent, newStatus: PostStatus) => {
    e.stopPropagation();
    if (newStatus === post.status) return;
    updatePostStatus(post.id, newStatus);
    toast.success(`Status atualizado: ${STATUS_CONFIG[newStatus].label}`);
  };

  return (
    <button
      onClick={() => {
        console.log(`[PostCard - onClick] Trying to open modal for post: ${post.id}`, post.title);
        openPostModal(post);
      }}
      className={cn(
        "w-full text-left group rounded-xl border transition-all duration-150",
        "hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
        "bg-white dark:bg-slate-800 overflow-hidden"
      )}
      style={{
        borderColor: `${client.brandColor}30`,
        borderLeftWidth: "3px",
        borderLeftColor: client.brandColor,
      }}
    >
      {/* Top: client identity */}
      <div
        className="px-2.5 pt-2.5 pb-1.5"
        style={{
          background: `linear-gradient(135deg, ${client.brandColor}08 0%, transparent 60%)`,
        }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          {/* Client avatar */}
          <div
            className="flex-shrink-0 rounded-md flex items-center justify-center text-white font-bold shadow-sm"
            style={{
              width: 20,
              height: 20,
              fontSize: 8,
              backgroundColor: client.brandColor,
            }}
          >
            {client.logoUrl ? (
              <img
                src={client.logoUrl}
                alt={client.name}
                className="w-full h-full rounded-md object-cover"
              />
            ) : (
              client.logoInitials
            )}
          </div>
          <span
            className="text-[10px] font-bold truncate flex-1 leading-none"
            style={{ color: client.brandColor }}
          >
            {client.name}
          </span>
          {post.driveLink && (
            <ExternalLink
              size={9}
              className="text-slate-300 dark:text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0"
            />
          )}
        </div>

        {/* Post title */}
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">
          {post.title}
        </p>
      </div>

      {/* Bottom: type + status */}
      <div className="px-2.5 pb-2.5 flex items-center gap-1.5 flex-wrap">
        {/* Post type */}
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-[9px] font-medium">
          <TypeIcon className={cn("flex-shrink-0 size-2.5", typeCfg.color)} />
          <span className="text-slate-500 dark:text-slate-400">{typeCfg.label}</span>
        </span>

        {/* Status — inline toggle via Popover */}
        <Popover>
          <PopoverTrigger
            asChild
            onClick={e => e.stopPropagation()}
          >
            <span
              role="button"
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-semibold cursor-pointer",
                "hover:brightness-95 active:brightness-90 transition-all dark:bg-opacity-20",
                statusCfg.bg, statusCfg.color
              )}
              title="Clique para mudar o status"
            >
              <span className={cn("rounded-full flex-shrink-0 size-1.5", statusCfg.dot)} />
              {statusCfg.label}
              <ChevronDown size={8} className="opacity-50" />
            </span>
          </PopoverTrigger>
          <PopoverContent
            className="w-40 p-1 shadow-lg"
            align="start"
            onClick={e => e.stopPropagation()}
          >
            {STATUS_ORDER.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const isActive = s === post.status;
              return (
                <button
                  key={s}
                  onClick={(e) => handleStatusChange(e, s)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer",
                    isActive
                      ? cn(cfg.bg, cfg.color, "font-semibold")
                      : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
                  <span className="flex-1 text-left">{cfg.label}</span>
                  {isActive && <Check size={10} className="flex-shrink-0" />}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>

        {/* Social Theme badge */}
        {post.socialTheme && SOCIAL_THEME_CONFIG[post.socialTheme as SocialTheme] && (
          <span className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded-md border text-[9px] font-semibold",
            SOCIAL_THEME_CONFIG[post.socialTheme as SocialTheme].bg,
            SOCIAL_THEME_CONFIG[post.socialTheme as SocialTheme].color,
          )}>
            {SOCIAL_THEME_CONFIG[post.socialTheme as SocialTheme].label}
          </span>
        )}

        {/* Time */}
        {post.scheduledTime && (
          <span className="ml-auto inline-flex items-center gap-0.5 text-[9px] text-slate-400 dark:text-slate-500">
            <Clock size={8} />
            {post.scheduledTime}
          </span>
        )}
      </div>
    </button>
  );
});

export function PostCardSkeleton() {
  return (
    <div className="w-full text-left rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-sm">
      <div className="px-2.5 pt-2.5 pb-1.5 flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-5 h-5 rounded-md flex-shrink-0" />
          <Skeleton className="h-2.5 w-16" />
        </div>
        <div className="space-y-1.5 mb-1">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="px-2.5 pb-2.5 flex items-center gap-1.5 mt-1">
        <Skeleton className="h-4 w-12 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
        <Skeleton className="h-2.5 w-8 rounded-md ml-auto" />
      </div>
    </div>
  );
}
