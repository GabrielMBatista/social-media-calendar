"use client";

import React, { useState, useCallback } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmActionDialogProps {
    children: React.ReactNode;
    title: string;
    description: string;
    actionText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    variant?: "destructive" | "default";
    disabled?: boolean;
}

export function ConfirmActionDialog({
    children,
    title,
    description,
    actionText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    variant = "destructive",
    disabled = false,
}: ConfirmActionDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await onConfirm();
        } finally {
            setIsLoading(false);
            setOpen(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className="pointer-events-auto rounded-[2rem] border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-8 max-w-[400px]">
                <AlertDialogHeader className="space-y-3">
                    <AlertDialogTitle className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight uppercase tracking-tight text-center">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0 mt-6 sm:space-x-3">
                    <AlertDialogCancel
                        disabled={isLoading || disabled}
                        className="rounded-2xl h-12 flex-1 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isLoading || disabled}
                        className={cn(
                            "rounded-2xl h-12 flex-1 transition-all active:scale-95 font-black uppercase tracking-widest text-[11px] px-8",
                            variant === "destructive"
                                ? "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 shadow-xl shadow-red-500/30"
                                : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xl shadow-blue-500/30",
                        )}
                    >
                        {isLoading ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                        {actionText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
