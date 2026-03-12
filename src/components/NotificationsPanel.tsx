"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    linkUrl?: string | null;
    read: boolean;
    createdAt: string;
}

export function NotificationsPanel() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        // Poll a cada 1 minuto (ideal seria socket ou SSE, mas fallback aceitável)
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.data || []);
                setUnreadCount(data.data?.filter((n: NotificationItem) => !n.read).length || 0);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const markAsRead = async (id: string, url?: string | null) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            // Atualiza visual local
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Se passou url, manda pro href
            if (url) {
                setOpen(false); // Fecha popover
                window.location.href = url;
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 text-slate-700 dark:text-slate-300">
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-[320px] p-0 rounded-xl overflow-hidden border border-slate-200 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Notificações</h4>
                    <Badge variant="secondary" className="text-[10px] px-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 pointer-events-none">
                        {unreadCount} novas
                    </Badge>
                </div>

                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-500 dark:text-slate-400 p-4">
                            <Bell size={32} className="opacity-20 mb-2" />
                            <p className="text-sm font-medium">Tudo limpo por aqui</p>
                            <p className="text-xs opacity-70">Nenhuma atualização no momento.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => markAsRead(notif.id, notif.linkUrl)}
                                    className={`
                    flex items-start gap-3 p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer transition-colors
                    ${!notif.read ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                  `}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {notif.type.includes("APPROVED") ? (
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                        ) : (
                                            <MessageCircle size={16} className="text-blue-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!notif.read ? "font-semibold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"} truncate`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                                            {/* O message contém negrito Markdown-like que criamos, formatamos simples pra UI */}
                                            {notif.message.replace(/\*\*/g, '')}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-wider">
                                            {new Date(notif.createdAt).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {!notif.read && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-center">
                    <span className="text-xs font-medium text-slate-400 cursor-default">Central de Alertas</span>
                </div>
            </PopoverContent>
        </Popover>
    );
}
