"use client";

import { useApp } from "@/contexts/AppContext";
import { useState, useEffect } from "react";
import { PostCard, PostCardSkeleton } from "./PostCard";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayOfWeek } from "@/lib/types";

export function MobileCalendarView() {
    const { filteredPosts, getClientById, openAddPostModal, getWeekDates, isLoading } = useApp();
    const weekDates = getWeekDates();

    // Vercel Debug: Log week dates generation to check UTC/BRT hydration mismatches
    if (typeof window !== "undefined") {
        console.log("[MobileCalendarView - Client] weekDates[0]:", weekDates[0]?.date?.toISOString());
    } else {
        console.log("[MobileCalendarView - Server] weekDates[0]:", weekDates[0]?.date?.toISOString());
    }

    // Track selected day
    const [selectedDayKey, setSelectedDayKey] = useState<string>("");

    useEffect(() => {
        // Inicializa com 'hoje' ou o primeiro dia na primeira vez que monta
        if (!selectedDayKey && weekDates.length > 0) {
            const today = weekDates.find(d => d.isToday);
            setSelectedDayKey(today ? today.key : weekDates[0].key);
        }
        // Quando muda a semana, o selectedDayKey (ex: 'seg') continua o mesmo, a menos que esteja vazio.
    }, [weekDates, selectedDayKey]);

    if (!selectedDayKey) return null;

    const selectedDateObj = weekDates.find(d => d.key === selectedDayKey);
    const selectedDate = selectedDateObj?.date || new Date();

    // Vercel Debug: Track if selectedDate shifts filtering logic between environments
    if (typeof window !== "undefined") {
        console.log(`[MobileCalendarView - Client] Filtering posts for ${selectedDayKey}:`, selectedDate.toISOString());
    }

    // Filter posts to show only those for the selected day
    const dayPosts = filteredPosts.filter(p => {
        if (p.dayOfWeek !== selectedDayKey) return false;
        // Se tem data agendada, mostrar apenas quando a data bate com esta coluna
        if (p.scheduledDate) {
            const scheduled = new Date(p.scheduledDate + "T00:00:00");
            return (
                scheduled.getFullYear() === selectedDate.getFullYear() &&
                scheduled.getMonth() === selectedDate.getMonth() &&
                scheduled.getDate() === selectedDate.getDate()
            );
        }
        return true;
    });

    return (
        <div className="md:hidden flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">

            {/* 1. Mobile Week Strip (Horizontal day selector) */}
            <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-2 py-3 shadow-sm z-10">
                <div className="flex justify-between items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                    {weekDates.map(({ key, date, label, isToday }) => {
                        const isSelected = key === selectedDayKey;

                        // Calculate how many posts for this specific day to show as an indicator dot
                        const postsCountThisDay = filteredPosts.filter(p => {
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
                        }).length;

                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedDayKey(key)}
                                className={cn(
                                    "flex flex-col items-center justify-center rounded-xl p-2 min-w-[45px] transition-all relative",
                                    isSelected
                                        ? "bg-blue-600 text-white shadow-md transform scale-105"
                                        : isToday
                                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                            >
                                <span className="text-[10px] font-semibold uppercase">{label}</span>
                                <span className="text-[16px] font-bold mt-0.5">{date.getDate()}</span>

                                {/* Post indicator dots */}
                                {postsCountThisDay > 0 && (
                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-300 ring-1 ring-white dark:ring-slate-900"
                                        style={isSelected ? { backgroundColor: 'white' } : {}}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Posts List for the Selected Day */}
            <div className="flex-1 overflow-y-auto w-full p-4 space-y-3 pb-24">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {selectedDateObj?.label},{" "}
                        {selectedDateObj?.date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
                        {selectedDateObj?.isToday && (
                            <span className="px-2 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full">
                                Hoje
                            </span>
                        )}
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">
                        {dayPosts.length} {dayPosts.length === 1 ? "post" : "posts"}
                    </span>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        <PostCardSkeleton />
                        <PostCardSkeleton />
                    </div>
                ) : dayPosts.length === 0 ? (
                    <div
                        onClick={() => openAddPostModal(selectedDayKey as DayOfWeek)}
                        className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
                    >
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                            <Plus className="text-slate-400" size={24} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhum post agendado</p>
                        <p className="text-xs text-slate-500 text-center mt-1">Toque para adicionar o primeiro post deste dia</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {dayPosts.map((post) => {
                            const client = getClientById(post.clientId) || ({
                                id: "unknown", name: "Cliente Removido", brandColor: "#94a3b8", logoInitials: "?", logoUrl: undefined
                            } as any);
                            return (
                                <div key={post.id} className="w-full relative z-10">
                                    {/* Reuse Desktop's PostCard but rendered inside the 1-column mobile view */}
                                    <PostCard post={post} client={client} />
                                </div>
                            );
                        })}

                        <button
                            onClick={() => openAddPostModal(selectedDayKey as DayOfWeek)}
                            className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/40 transition-colors"
                        >
                            <Plus size={16} />
                            Adicionar Novo Post
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
