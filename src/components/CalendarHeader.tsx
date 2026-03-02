"use client";

// Social Media Calendar Pro — CalendarHeader Component
// Design: Studio Criativo — header com navegação semanal e métricas rápidas

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "next-themes";
import { PostStatus, STATUS_CONFIG } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft, ChevronRight, CalendarDays, RotateCcw,
  Plus, TrendingUp, Sun, Moon, User, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/app/actions/auth";


export function CalendarHeader() {
  const { navigateWeek, currentWeekOffset, getWeekDates, filteredPosts, openAddPostModal, openAccountModal } = useApp();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [userName, setUserName] = useState<string>("Carregando...");
  const [mounted, setMounted] = useState(false);

  const capitalizeWords = (str: string) => {
    return str
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const userFullName = userName !== "Carregando..." && userName !== "Usuário Logado"
    ? capitalizeWords(userName)
    : userName;

  const userFirstName = userFullName.split(" ")[0];

  const userInitials = userFirstName !== "Carregando..." && userFirstName !== "Usuário Logado"
    ? userFirstName.charAt(0)
    : "U";

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user?.user_metadata?.display_name) {
        setUserName(data.user.user_metadata.display_name);
      } else {
        setUserName("Usuário Logado");
      }
    });

    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const weekDates = getWeekDates();
  const weekStart = weekDates[0]?.date;
  const weekEnd = weekDates[6]?.date;

  const formatWeekRange = () => {
    if (!weekStart || !weekEnd) return "";
    const startStr = weekStart.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
    const endStr = weekEnd.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
    return `${startStr} – ${endStr}`;
  };

  // Quick stats
  const statuses: PostStatus[] = ["pronto", "em_producao", "rascunho", "publicado"];
  const stats = statuses.map(status => ({
    status,
    count: filteredPosts.filter(p => p.status === status).length,
  }));

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-3 flex-shrink-0">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Logo + Week navigation */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
              <CalendarDays size={16} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>
                SM Calendar
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">Social Media Pro</p>
            </div>
          </div>

          <div className="w-px h-7 bg-slate-200 hidden sm:block" />

          {/* Week navigation */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("prev")}
              className="h-8 w-8 p-0 border-slate-200"
            >
              <ChevronLeft size={14} />
            </Button>

            <div className="text-center min-w-[160px] px-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{formatWeekRange()}</p>
              {currentWeekOffset === 0 ? (
                <p className="text-[10px] text-blue-500 font-semibold">Semana atual</p>
              ) : (
                <p className="text-[10px] text-slate-400">
                  {currentWeekOffset < 0
                    ? `${Math.abs(currentWeekOffset)} sem. atrás`
                    : `${currentWeekOffset} sem. à frente`}
                </p>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("next")}
              className="h-8 w-8 p-0 border-slate-200"
            >
              <ChevronRight size={14} />
            </Button>

            {currentWeekOffset !== 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("current")}
                className="h-8 px-2 gap-1 text-xs border-slate-200 hidden sm:flex"
              >
                <RotateCcw size={11} />
                Hoje
              </Button>
            )}
          </div>
        </div>

        {/* Center: Quick stats */}
        <div className="hidden xl:flex items-center gap-1.5 flex-1 justify-center">
          {stats.map(({ status, count }) => {
            const cfg = STATUS_CONFIG[status];
            return (
              <div
                key={status}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold",
                  "dark:bg-opacity-10 dark:text-opacity-90 dark:border-opacity-20",
                  cfg.bg, cfg.color
                )}
              >
                <span className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
                <span className="font-bold">{count}</span>
                <span className="font-normal opacity-80">{cfg.label}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-md text-xs font-bold ring-1 ring-slate-900/5 dark:ring-white/10 transition-transform hover:scale-105 cursor-default mt-[-1px]">
            <TrendingUp size={14} className="opacity-90" />
            <span>{filteredPosts.length} post{filteredPosts.length !== 1 && 's'}</span>
          </div>
        </div>

        {/* Right: Theme toggle + Add post */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0 border-slate-200 dark:border-slate-700 dark:text-slate-300"
            title={isDark ? "Modo claro" : "Modo escuro"}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </Button>
          <Button
            onClick={() => openAddPostModal("seg")}
            size="sm"
            className="h-8 gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Novo Post</span>
          </Button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 ml-1 hidden sm:block" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 p-1 transition-colors outline-none focus:ring-2 focus:ring-blue-500/20">
                <div className="w-8 h-8 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-800">
                  <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400">{userInitials}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{userFullName}</p>
                <p className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Admin</p>
              </div>
              <DropdownMenuItem
                onClick={openAccountModal}
                className="text-xs gap-2 py-2 cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800"
              >
                <User size={14} className="text-slate-500" />
                Minha Conta
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOutAction()}
                className="text-xs gap-2 py-2 text-red-600 focus:text-red-700 cursor-pointer"
              >
                <LogOut size={14} />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header >
  );
}
