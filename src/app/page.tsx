"use client";

// Social Media Calendar Pro — App UI (Home Page)
// Agora portado nativamente para o Next.js App Router

import { useState, useEffect } from "react";
import { AppProvider } from "@/contexts/AppContext";
import { ClientSidebar } from "@/components/ClientSidebar";
import { CalendarHeader } from "@/components/CalendarHeader";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DayColumn } from "@/components/DayColumn";
import { ListView } from "@/components/ListView";
import { PostModal } from "@/components/PostModal";
import { AddPostModal } from "@/components/AddPostModal";
import { ClientModal } from "@/components/ClientModal";
import { AccountModal } from "@/components/AccountModal";
import { useApp } from "@/contexts/AppContext";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "calendar" | "list";

function CalendarGrid() {
    const { getWeekDates } = useApp();
    const weekDates = getWeekDates();

    return (
        <div className="flex-1 overflow-auto p-4">
            <div
                className="grid gap-3 min-w-[900px]"
                style={{
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    minHeight: "calc(100vh - 130px)",
                }}
            >
                {weekDates.map(({ key, date, label, isToday }) => (
                    <DayColumn
                        key={key}
                        dayKey={key}
                        date={date}
                        label={label}
                        isToday={isToday}
                    />
                ))}
            </div>
        </div>
    );
}

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
    return (
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
                onClick={() => onChange("calendar")}
                className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                    view === "calendar"
                        ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}
            >
                <LayoutGrid size={13} />
                Calendário
            </button>
            <button
                onClick={() => onChange("list")}
                className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                    view === "list"
                        ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}
            >
                <List size={13} />
                Lista
            </button>
        </div>
    );
}

function AppLayout() {
    const [viewMode, setViewMode] = useState<ViewMode>("calendar");

    useEffect(() => {
        if (window.innerWidth < 768) {
            setViewMode("list");
        }
    }, []);

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 pb-16 md:pb-0">
            <MobileHeader />
            <div className="hidden md:flex flex-col flex-shrink-0">
                <CalendarHeader />
            </div>

            {/* View toggle bar */}
            <div className="hidden md:flex bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-2 items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <ViewToggle view={viewMode} onChange={setViewMode} />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-600 hidden sm:block">
                    Clique em qualquer post para ver detalhes e editar
                </p>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                <div className="hidden md:flex flex-shrink-0">
                    <ClientSidebar />
                </div>
                <main className="flex-1 overflow-hidden flex flex-col w-full">
                    {viewMode === "calendar" ? <CalendarGrid /> : <ListView />}
                </main>
            </div>

            <MobileBottomNav view={viewMode} onChangeView={setViewMode} />

            {/* Modals */}
            <PostModal />
            <AddPostModal />
            <ClientModal />
            <AccountModal />
        </div>
    );
}

export default function Page() {
    return (
        <AppProvider>
            <AppLayout />
        </AppProvider>
    );
}
