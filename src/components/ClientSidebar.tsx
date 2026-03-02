"use client";

// Social Media Calendar Pro — ClientSidebar Component
// Design: Studio Criativo — sidebar com identidade visual dos clientes

import { useApp } from "@/contexts/AppContext";
import { PostStatus, STATUS_CONFIG } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Plus, Users, LayoutGrid, Edit2, Trash2, MoreVertical, Search, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function ClientSidebar() {
  const {
    clients, posts, selectedClientFilter, selectedStatusFilter,
    setClientFilter, setStatusFilter, openClientModal, deleteClient
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");

  const activeClients = clients.filter(c =>
    c.active && (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getClientPostCount = (clientId: string) =>
    posts.filter(p => p.clientId === clientId).length;

  const getStatusCount = (status: PostStatus) =>
    posts.filter(p => p.status === status).length;

  const handleDeleteClient = (clientId: string, clientName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Excluir o cliente "${clientName}" e todos os seus posts?`)) {
      deleteClient(clientId);
      toast.success("Cliente excluído");
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-100 dark:border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Users size={12} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest font-outfit">
              Clientes
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => openClientModal()}
            className="h-7 px-2.5 text-[10px] font-black uppercase tracking-widest gap-1 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-500 shadow-md transition-all active:scale-95"
          >
            <Plus size={12} />
            Novo
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative group">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar agência..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-300 transition-colors"
            >
              <XCircle size={12} />
            </button>
          )}
        </div>
      </div>

      {/* All clients filter */}
      <div className="px-3 pt-2.5">
        <button
          onClick={() => setClientFilter(null)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer",
            selectedClientFilter === null
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <LayoutGrid size={13} className="flex-shrink-0" />
          <span className="flex-1 text-left text-xs text-slate-800 dark:text-slate-200">Todos os Clientes</span>
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-md font-bold",
            selectedClientFilter === null ? "bg-white/20 text-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          )}>
            {posts.length}
          </span>
        </button>
      </div>

      {/* Client list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {activeClients.map(client => {
          const count = getClientPostCount(client.id);
          const isSelected = selectedClientFilter === client.id;

          return (
            <div
              key={client.id}
              className={cn(
                "group flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all cursor-pointer",
                isSelected
                  ? "shadow-sm"
                  : "hover:bg-slate-50"
              )}
              style={isSelected ? {
                backgroundColor: client.brandColor,
                color: "white",
              } : {}}
              onClick={() => setClientFilter(isSelected ? null : client.id)}
            >
              {/* Avatar */}
              <div
                className="flex-shrink-0 rounded-lg flex items-center justify-center text-white font-bold text-[9px] shadow-sm transition-all"
                style={{
                  width: 26,
                  height: 26,
                  backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : client.brandColor,
                  border: isSelected ? "1.5px solid rgba(255,255,255,0.3)" : "none",
                }}
              >
                {client.logoUrl ? (
                  <img
                    src={client.logoUrl}
                    alt={client.name}
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : client.logoInitials}
              </div>

              {/* Name + industry */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-[11px] font-bold truncate leading-none",
                  isSelected ? "text-white" : "text-slate-800"
                )}>
                  {client.name}
                </p>
                {client.industry && (
                  <p className={cn(
                    "text-[10px] truncate mt-0.5 leading-none",
                    isSelected ? "text-white/70" : "text-slate-400 dark:text-slate-500"
                  )}>
                    {client.industry}
                  </p>
                )}
              </div>

              {/* Count + actions */}
              <div className="flex items-center gap-0.5">
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                  isSelected ? "bg-white/20 text-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                )}>
                  {count}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                        isSelected
                          ? "hover:bg-white/20 text-white"
                          : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"
                      )}
                      onClick={e => e.stopPropagation()}
                    >
                      <MoreVertical size={11} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem
                      onClick={e => { e.stopPropagation(); openClientModal(client); }}
                      className="gap-2 text-xs"
                    >
                      <Edit2 size={11} /> Editar cliente
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={e => handleDeleteClient(client.id, client.name, e)}
                      className="gap-2 text-xs text-red-600 focus:text-red-600"
                    >
                      <Trash2 size={11} /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status filters */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-3">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
          Por Status
        </p>
        <div className="space-y-0.5">
          <button
            onClick={() => setStatusFilter(null)}
            className={cn(
              "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer",
              selectedStatusFilter === null
                ? "bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
            <span className="flex-1 text-left">Todos</span>
            <span className={cn(
              "text-[10px] font-bold px-1 py-0.5 rounded",
              selectedStatusFilter === null ? "bg-white/20 text-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500"
            )}>
              {posts.length}
            </span>
          </button>

          {(Object.entries(STATUS_CONFIG) as [PostStatus, typeof STATUS_CONFIG[PostStatus]][]).map(([key, cfg]) => {
            const count = getStatusCount(key);
            const isActive = selectedStatusFilter === key;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(isActive ? null : key)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer",
                  isActive
                    ? cn(cfg.bg, cfg.color, "font-semibold border")
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <span className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
                <span className="flex-1 text-left">{cfg.label}</span>
                <span className={cn(
                  "text-[10px] font-bold px-1 py-0.5 rounded",
                  isActive ? "bg-white/60 dark:bg-white/10" : "bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
