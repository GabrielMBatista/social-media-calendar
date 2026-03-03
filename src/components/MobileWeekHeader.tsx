"use client";

import { useApp } from "@/contexts/AppContext";
import { PostStatus, STATUS_CONFIG } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileWeekHeader() {
    const { navigateWeek, currentWeekOffset, getWeekDates, filteredPosts } = useApp();

    const weekDates = getWeekDates();
    const weekStart = weekDates[0]?.date;
    const weekEnd = weekDates[6]?.date;

    const formatWeekRange = () => {
        if (!weekStart || !weekEnd) return "";
        const startStr = weekStart.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
        const endStr = weekEnd.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
        return `${startStr} - ${endStr}`;
    };

    const statuses: PostStatus[] = ["pronto", "em_producao", "rascunho", "publicado"];
    const stats = statuses.map(status => ({
        status,
        count: filteredPosts.filter(p => p.status === status).length,
    }));

    return (
        <div className="md:hidden flex flex-col bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            {/* Top row: Week Navigation */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-50 dark:border-slate-800/50">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateWeek("prev")}
                        className="h-8 w-8 text-slate-600 dark:text-slate-300"
                    >
                        <ChevronLeft size={16} />
                    </Button>

                    <div className="flex flex-col items-center min-w-[120px]">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {formatWeekRange()}
                        </span>
                        <span className={cn(
                            "text-[9px] uppercase tracking-wider font-semibold",
                            currentWeekOffset === 0 ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                        )}>
                            {currentWeekOffset === 0
                                ? "Semana atual"
                                : currentWeekOffset < 0
                                    ? `${Math.abs(currentWeekOffset)} sem. atrás`
                                    : `${currentWeekOffset} sem. à frente`}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateWeek("next")}
                        className="h-8 w-8 text-slate-600 dark:text-slate-300"
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>

                {currentWeekOffset !== 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateWeek("current")}
                        className="h-7 px-2 gap-1 text-[10px] font-semibold"
                    >
                        <RotateCcw size={10} />
                        Hoje
                    </Button>
                )}
            </div>

            {/* Bottom row: Scrollable Stats */}
            <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 flex-shrink-0">
                    <TrendingUp size={12} className="opacity-90" />
                    <span className="text-[10px] font-bold">{filteredPosts.length} posts</span>
                </div>

                {stats.map(({ status, count }) => {
                    const cfg = STATUS_CONFIG[status];
                    return (
                        <div
                            key={status}
                            className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-semibold flex-shrink-0",
                                cfg.bg, cfg.color
                            )}
                        >
                            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                            <span className="font-bold">{count}</span>
                            <span className="font-normal opacity-80 whitespace-nowrap">{cfg.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
