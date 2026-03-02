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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
          {/* Client selector */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Cliente *
            </Label>
            <Select value={form.clientId} onValueChange={v => setForm(p => ({ ...p, clientId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente..." />
              </SelectTrigger>
              <SelectContent>
                {activeClients.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                        style={{ backgroundColor: c.brandColor }}
                      >
                        {c.logoInitials}
                      </div>
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Título *
            </Label>
            <Input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Ex: Promoção Dia das Mães"
            />
          </div>

          {/* Type + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Tipo de Post
              </Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as PostType }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(POST_TYPE_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Status
              </Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as PostStatus }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                        {cfg.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Day + Time */}
          {!addPostDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Dia da Semana
                </Label>
                <Select value={form.dayOfWeek} onValueChange={v => setForm(p => ({ ...p, dayOfWeek: v as DayOfWeek }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(d => (
                      <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Horário
                </Label>
                <Input
                  type="time"
                  value={form.scheduledTime}
                  onChange={e => setForm(p => ({ ...p, scheduledTime: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Drive link */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Link do Drive
            </Label>
            <Input
              value={form.driveLink}
              onChange={e => setForm(p => ({ ...p, driveLink: e.target.value }))}
              placeholder="https://drive.google.com/..."
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Descrição / Briefing
            </Label>
            <Textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              placeholder="Descreva o conteúdo do post..."
              className="resize-none"
            />
          </div>

          {/* Caption */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Legenda
            </Label>
            <Textarea
              value={form.caption}
              onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
              rows={2}
              placeholder="Legenda para publicação..."
              className="resize-none"
            />
          </div>

          {/* Hashtags */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Hashtags
            </Label>
            <Input
              value={form.hashtags}
              onChange={e => setForm(p => ({ ...p, hashtags: e.target.value }))}
              placeholder="#hashtag1 #hashtag2..."
            />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Observações
            </Label>
            <Input
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notas internas..."
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
