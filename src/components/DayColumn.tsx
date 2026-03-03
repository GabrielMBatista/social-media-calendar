import React from "react";
import { DayOfWeek } from "@/lib/types";
import { useApp } from "@/contexts/AppContext";
import { PostCard, PostCardSkeleton } from "./PostCard";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface DayColumnProps {
  dayKey: DayOfWeek;
  date: Date;
  label: string;
  isToday: boolean;
}

export const DayColumn = React.memo(function DayColumn({ dayKey, date, label, isToday }: DayColumnProps) {
  const { filteredPosts, getClientById, openAddPostModal, isLoading } = useApp();

  const dayPosts = filteredPosts.filter(p => {
    if (p.dayOfWeek !== dayKey) return false;
    // Se tem data agendada, mostrar apenas quando a data bate com esta coluna
    if (p.scheduledDate) {
      const scheduled = new Date(p.scheduledDate + "T00:00:00");
      return (
        scheduled.getFullYear() === date.getFullYear() &&
        scheduled.getMonth() === date.getMonth() &&
        scheduled.getDate() === date.getDate()
      );
    }
    // Sem scheduledDate → post recorrente/rascunho: aparece em toda semana
    return true;
  });
  const dayNumber = date.getDate();
  const monthShort = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border transition-all duration-300 group/col relative",
        isToday
          ? "border-blue-400 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-900/40 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20 z-10 scale-[1.02]"
          : "border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700"
      )}
    >
      {/* Day header */}
      <div className={cn(
        "flex items-center justify-between px-3 py-2.5 border-b rounded-t-xl",
        isToday ? "border-blue-100 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40" : "border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60"
      )}>
        <div className="flex items-center gap-2">
          {/* Day number badge */}
          <div className={cn(
            "flex flex-col items-center justify-center rounded-lg w-9 h-9 flex-shrink-0 transition-colors",
            isToday
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          )}>
            <span className="text-[9px] font-semibold leading-none uppercase">{label}</span>
            <span className="text-[15px] font-bold leading-tight">{dayNumber}</span>
          </div>
          <div>
            <p className={cn(
              "text-[10px] font-medium uppercase tracking-wide",
              isToday ? "text-blue-500" : "text-slate-400 dark:text-slate-500"
            )}>
              {monthShort}
            </p>
            <p className={cn(
              "text-xs font-bold leading-none mt-1",
              isToday ? "text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"
            )}>
              {dayPosts.length} {dayPosts.length === 1 ? "post" : "posts"}
            </p>
          </div>
        </div>

        {/* Progress Bar (Radial or simple) */}
        {dayPosts.length > 0 && (
          <div className="flex items-center gap-1.5 ml-auto mr-2">
            <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
              <div
                className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                style={{ width: `${(dayPosts.filter(p => p.status === 'publicado').length / dayPosts.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Add post button — visible on hover */}
        <button
          onClick={() => openAddPostModal(dayKey)}
          className={cn(
            "rounded-lg p-1.5 transition-all duration-150",
            "text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30",
            "opacity-0 group-hover/col:opacity-100"
          )}
          title={`Adicionar post na ${label}`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Posts list */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[120px]">
        {isLoading ? (
          <div className="space-y-2 px-1">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : dayPosts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-8 gap-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition-all"
            onClick={() => openAddPostModal(dayKey)}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              "bg-slate-100 dark:bg-slate-800 group-hover/col:bg-blue-100 dark:group-hover/col:bg-blue-950"
            )}>
              <Plus size={14} className="text-slate-300 dark:text-slate-600 group-hover/col:text-blue-400 transition-colors" />
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-600 hover:text-blue-500 transition-colors">
              Adicionar post
            </span>
          </div>
        ) : (
          <>
            {dayPosts.map((post, idx) => {
              const client = getClientById(post.clientId);
              if (!client) return null;
              return (
                <div
                  key={post.id}
                  className="post-card-enter"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <PostCard post={post} client={client} />
                </div>
              );
            })}

            {/* Add more button */}
            <button
              onClick={() => openAddPostModal(dayKey)}
              className={cn(
                "w-full flex items-center justify-center gap-1.5 py-2 rounded-lg",
                "text-[11px] text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400",
                "border border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700",
                "transition-all hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
              )}
            >
              <Plus size={11} />
              Adicionar
            </button>
          </>
        )}
      </div>
    </div>
  );
});
