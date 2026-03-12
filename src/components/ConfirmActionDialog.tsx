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
            <AlertDialogContent className="pointer-events-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:space-x-2">
                    <AlertDialogCancel disabled={isLoading || disabled}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isLoading || disabled}
                        className={cn(
                            "transition-all active:scale-95 font-semibold rounded-xl px-6",
                            variant === "destructive"
                                ? "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 shadow-md shadow-red-500/20"
                                : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-md shadow-blue-500/20",
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
