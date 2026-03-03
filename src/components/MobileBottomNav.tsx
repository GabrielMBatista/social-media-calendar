"use client";

import { useApp } from "@/contexts/AppContext";
import { LayoutGrid, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
    view: "calendar" | "list";
    onChangeView: (v: "calendar" | "list") => void;
}

export function MobileBottomNav({ view, onChangeView }: MobileBottomNavProps) {
    const { openAddPostModal } = useApp();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe z-50">
            <div className="flex items-center justify-around px-2 py-2">
                <button
                    onClick={() => onChangeView("calendar")}
                    className={cn(
                        "flex flex-col items-center justify-center w-20 h-14 gap-1 rounded-xl transition-colors",
                        view === "calendar" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                >
                    <LayoutGrid size={22} className={cn(view === "calendar" && "fill-blue-600/20")} />
                    <span className="text-[10px] font-bold">Mês</span>
                </button>

                <div className="relative -top-6">
                    <button
                        onClick={() => openAddPostModal("seg")}
                        className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/30 transition-transform active:scale-95 border-4 border-slate-50 dark:border-slate-950"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                <button
                    onClick={() => onChangeView("list")}
                    className={cn(
                        "flex flex-col items-center justify-center w-20 h-14 gap-1 rounded-xl transition-colors",
                        view === "list" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                >
                    <List size={22} />
                    <span className="text-[10px] font-bold">Lista</span>
                </button>
            </div>
        </div>
    );
}
