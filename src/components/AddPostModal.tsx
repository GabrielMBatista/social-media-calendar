"use client";

// Social Media Calendar Pro — AddPostModal Component
// Design: Studio Criativo — modal para adicionar novo post

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { PostStatus, PostType, DayOfWeek, DAYS_OF_WEEK, POST_TYPE_CONFIG, STATUS_CONFIG } from "@/lib/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AddPostModal() {
  const { isAddPostModalOpen, closeAddPostModal, addPost, clients, addPostDay } = useApp();

  const [form, setForm] = useState({
    clientId: "",
    title: "",
    description: "",
    type: "feed" as PostType,
    status: "rascunho" as PostStatus,
    dayOfWeek: addPostDay ?? "seg" as DayOfWeek,
    scheduledTime: "",
    driveLink: "",
    caption: "",
    hashtags: "",
    notes: "",
  });

  const handleSubmit = () => {
    if (!form.clientId) { toast.error("Selecione um cliente"); return; }
    if (!form.title.trim()) { toast.error("Informe o título do post"); return; }

    addPost({
      ...form,
      dayOfWeek: addPostDay ?? form.dayOfWeek,
    });
    toast.success("Post adicionado ao calendário!");
    closeAddPostModal();
    setForm({
      clientId: "", title: "", description: "", type: "feed", status: "rascunho",
      dayOfWeek: "seg", scheduledTime: "", driveLink: "", caption: "", hashtags: "", notes: "",
    });
  };

  const activeClients = clients.filter(c => c.active);

  return (
    <Dialog open={isAddPostModalOpen} onOpenChange={open => !open && closeAddPostModal()}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-6 flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Novo Post
            {addPostDay && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                — {DAYS_OF_WEEK.find(d => d.key === addPostDay)?.label}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title + Client row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Cliente *
              </Label>
              <Select value={form.clientId} onValueChange={v => setForm(p => ({ ...p, clientId: v }))}>
                <SelectTrigger className="h-9 text-xs bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {activeClients.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0"
                          style={{ backgroundColor: c.brandColor }}
                        >
                          {c.logoInitials}
                        </div>
                        <span className="text-xs">{c.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Título do Post *
              </Label>
              <Input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Campanha Dia dos Pais"
                className="h-9 text-xs bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Type + Status + Time row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Tipo
              </Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as PostType }))}>
                <SelectTrigger className="h-9 text-xs bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(POST_TYPE_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key} className="text-xs">{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Status
              </Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as PostStatus }))}>
                <SelectTrigger className="h-9 text-xs bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                        {cfg.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={cn("col-span-1", addPostDay ? "" : "hidden md:block")}>
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Horário
              </Label>
              <Input
                type="time"
                value={form.scheduledTime}
                onChange={e => setForm(p => ({ ...p, scheduledTime: e.target.value }))}
                className="h-9 text-xs bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          {/* Day selection only if not fixed */}
          {!addPostDay && (
            <div>
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Dia da Semana
              </Label>
              <Select value={form.dayOfWeek} onValueChange={v => setForm(p => ({ ...p, dayOfWeek: v as DayOfWeek }))}>
                <SelectTrigger className="h-9 text-xs bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map(d => (
                    <SelectItem key={d.key} value={d.key} className="text-xs">{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Links + Hashtags row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Link do Drive
              </Label>
              <Input
                value={form.driveLink}
                onChange={e => setForm(p => ({ ...p, driveLink: e.target.value }))}
                placeholder="https://drive.google.com/..."
                className="h-9 text-xs bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
              />
            </div>
            <div>
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Hashtags
              </Label>
              <Input
                value={form.hashtags}
                onChange={e => setForm(p => ({ ...p, hashtags: e.target.value }))}
                placeholder="#hashtag1 #hashtag2..."
                className="h-9 text-xs bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          {/* Description + Caption row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Descrição / Briefing
              </Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={4}
                placeholder="Descreva o conteúdo do post..."
                className="text-xs resize-none bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 shadow-sm"
              />
            </div>
            <div>
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Legenda
              </Label>
              <Textarea
                value={form.caption}
                onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
                rows={4}
                placeholder="Legenda para publicação..."
                className="text-xs resize-none bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 shadow-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
              Observações Internas
            </Label>
            <Input
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notas para a agência ou designer..."
              className="h-9 text-xs bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeAddPostModal}>Cancelar</Button>
          <Button onClick={handleSubmit}>Adicionar Post</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
