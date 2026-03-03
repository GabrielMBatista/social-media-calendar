"use client";

// Social Media Calendar Pro — AddPostModal Component
// Design: Studio Criativo — modal para adicionar novo post

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { PostStatus, PostType, DayOfWeek, DAYS_OF_WEEK, POST_TYPE_CONFIG, STATUS_CONFIG } from "@/lib/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
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
import { Loader2 } from "lucide-react";

export function AddPostModal() {
  const { isAddPostModalOpen, closeAddPostModal, addPost, clients, addPostDay, addPostMutation, getWeekDates } = useApp();

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

    const finalDayOfWeek = addPostDay ?? form.dayOfWeek;

    // Calcula a data específica na semana atual que o usuário está visualizando
    const weekDates = getWeekDates();
    const targetDayObj = weekDates.find(d => d.key === finalDayOfWeek);
    let scheduledDateStr: string | undefined = undefined;

    if (targetDayObj) {
      const d = targetDayObj.date;
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const dt = String(d.getDate()).padStart(2, '0');
      scheduledDateStr = `${yr}-${mo}-${dt}`;
    }

    addPost({
      ...form,
      dayOfWeek: finalDayOfWeek,
      scheduledDate: scheduledDateStr,
    });
    toast.success("Post adicionado ao calendário!");
    closeAddPostModal();
    setForm({
      clientId: "", title: "", description: "", type: "feed", status: "rascunho",
      dayOfWeek: "seg", scheduledTime: "", driveLink: "", caption: "", hashtags: "", notes: "",
    });
  };

  const activeClients = clients.filter(c => c.active);
  const { clientId, title } = form; // Destructure for easier access in disabled prop

  return (
    <Dialog open={isAddPostModalOpen} onOpenChange={open => !open && closeAddPostModal()}>
      <DialogContent className="max-w-2xl max-h-[90dvh] md:max-h-[85vh] flex flex-col overflow-hidden p-0 sm:p-6 pointer-events-auto">
        <DialogHeader className="px-6 pt-6 sm:px-0 sm:pt-0 pb-2 border-b sm:border-0 border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-lg font-bold flex items-center flex-wrap gap-2">
            Novo Post
            {addPostDay && (
              <span className="text-sm font-normal text-slate-500 whitespace-nowrap">
                — {DAYS_OF_WEEK.find(d => d.key === addPostDay)?.label}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">Preencha os detalhes do novo post aqui.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-2 pb-12 sm:pb-2 overflow-y-auto overflow-x-hidden flex-1">
          {/* Title + Client row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="md:col-span-1">
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Cliente *
              </Label>
              <Select value={form.clientId} onValueChange={v => setForm(p => ({ ...p, clientId: v }))}>
                <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
                className="h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Type + Status + Time row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div>
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Tipo
              </Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as PostType }))}>
                <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
                <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
            <div className={cn("col-span-2 md:col-span-1", addPostDay ? "" : "hidden md:block")}>
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Horário
              </Label>
              <Input
                type="time"
                value={form.scheduledTime}
                onChange={e => setForm(p => ({ ...p, scheduledTime: e.target.value }))}
                className="h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
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
                <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Link do Drive
              </Label>
              <Input
                value={form.driveLink}
                onChange={e => setForm(p => ({ ...p, driveLink: e.target.value }))}
                placeholder="https://drive.google.com/..."
                className="h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
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
                className="h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          {/* Description + Caption row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
                Descrição / Briefing
              </Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={4}
                placeholder="Descreva o conteúdo do post..."
                className="text-xs resize-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 shadow-sm"
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
                className="text-xs resize-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 shadow-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="pb-6 sm:pb-2">
            <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">
              Observações Internas
            </Label>
            <Input
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notas para a agência ou designer..."
              className="h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.2)]">
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button variant="outline" onClick={closeAddPostModal} className="w-full sm:w-auto pointer-events-auto">Cancelar</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white dark:text-white w-full sm:w-auto pointer-events-auto">Adicionar Post</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
