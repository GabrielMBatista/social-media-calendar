"use client";

import { useTheme } from "next-themes";
import { Menu, CalendarDays, Sun, Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ClientSidebar } from "./ClientSidebar";
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";

export function MobileHeader() {
    const { setTheme, resolvedTheme } = useTheme();
    const { openAccountModal } = useApp();
    const isDark = resolvedTheme === "dark";
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    return (
        <header className="flex md:hidden items-center justify-between bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-3">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 -ml-2 text-slate-700 dark:text-slate-300">
                            <Menu size={20} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[280px]">
                        <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                        <ClientSidebar />
                    </SheetContent>
                </Sheet>

                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                        <CalendarDays size={14} className="text-white" />
                    </div>
                    <h1 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 leading-none">
                        SM Calendar
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="h-9 w-9 text-slate-700 dark:text-slate-300"
                >
                    {mounted ? (isDark ? <Sun size={18} /> : <Moon size={18} />) : <Sun size={18} />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={openAccountModal}
                    className="h-9 w-9 text-slate-700 dark:text-slate-300"
                >
                    <User size={18} />
                </Button>
            </div>
        </header>
    );
}
