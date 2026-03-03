"use client";

// Social Media Calendar Pro — PostModal Component
// Design: Studio Criativo — painel lateral deslizante com detalhes do post

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { PostStatus, STATUS_CONFIG, POST_TYPE_CONFIG, DAYS_OF_WEEK } from "@/lib/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ExternalLink, Trash2, Edit3, Save, X, Clock, Calendar,
  Hash, FileText, Link2, Image, Play, LayoutGrid, Music,
  Youtube, Linkedin, Twitter, CheckCircle2, AlertCircle, Circle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Image, Play, Clock, LayoutGrid, Music, Youtube, Linkedin, Twitter,
};

const STATUS_ORDER: PostStatus[] = ["rascunho", "em_producao", "pronto", "publicado", "cancelado"];

export function PostModal() {
  const { selectedPost, isPostModalOpen, closePostModal, updatePost, deletePost, getClientById, clients, updatePostMutation, deletePostMutation } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<typeof selectedPost>>({});

  if (!selectedPost) return null;

  const client = getClientById(selectedPost.clientId);
  if (!client) return null;

  const statusCfg = STATUS_CONFIG[selectedPost.status];
  const typeCfg = POST_TYPE_CONFIG[selectedPost.type];
  const TypeIcon = ICON_MAP[typeCfg.icon] ?? Image;
  const dayLabel = DAYS_OF_WEEK.find(d => d.key === selectedPost.dayOfWeek)?.label ?? selectedPost.dayOfWeek;

  const handleStartEdit = () => {
    setEditData({
      title: selectedPost.title,
      description: selectedPost.description,
      caption: selectedPost.caption,
      hashtags: selectedPost.hashtags,
      driveLink: selectedPost.driveLink,
      notes: selectedPost.notes,
      scheduledTime: selectedPost.scheduledTime,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updatePost(selectedPost.id, editData as any);
    setIsEditing(false);
    toast.success("Post atualizado com sucesso!");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleStatusChange = (status: PostStatus) => {
    updatePost(selectedPost.id, { status });
    toast.success(`Status alterado para "${STATUS_CONFIG[status].label}"`);
  };

  const handleDelete = () => {
    if (confirm(`Excluir o post "${selectedPost.title}"?`)) {
      deletePost(selectedPost.id);
      toast.success("Post excluído");
    }
  };

  const handleOpenDrive = () => {
    if (selectedPost.driveLink) {
      window.open(selectedPost.driveLink, "_blank");
    }
  };

  return (
    <Dialog open={isPostModalOpen} onOpenChange={open => !open && closePostModal()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header with client identity */}
        <div
          className="px-6 py-4 flex items-start gap-4"
          style={{
            background: `linear-gradient(135deg, ${client.brandColor}15 0%, ${client.brandColor}08 100%)`,
            borderBottom: `3px solid ${client.brandColor}`,
          }}
        >
          {/* Client avatar */}
          <div
            className="flex-shrink-0 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
            style={{
              width: 48,
              height: 48,
              backgroundColor: client.brandColor,
            }}
          >
            {client.logoUrl ? (
              <img src={client.logoUrl} alt={client.name} className="w-full h-full rounded-xl object-cover" />
            ) : (
              client.logoInitials
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold mb-0.5" style={{ color: client.brandColor }}>
              {client.name}
              {client.instagramHandle && (
                <span className="text-slate-400 font-normal ml-2">{client.instagramHandle}</span>
              )}
            </p>
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {isEditing ? (
                <Input
                  value={(editData as any).title ?? ""}
                  onChange={e => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-lg font-bold h-auto py-1 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              ) : selectedPost.title}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {/* Type badge */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium shadow-sm transition-all">
                <TypeIcon className={cn("size-3", typeCfg.color)} />
                <span className="text-slate-600 dark:text-slate-300">{typeCfg.label}</span>
              </span>
              {/* Day + time */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 shadow-sm transition-all">
                <Calendar size={11} />
                {dayLabel}
                {selectedPost.scheduledTime && (
                  <>
                    <Clock size={11} className="ml-1" />
                    {selectedPost.scheduledTime}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSaveEdit} disabled={updatePostMutation.isPending} className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white dark:text-white shadow-md transition-all active:scale-95">
                  {updatePostMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Salvar
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={updatePostMutation.isPending} className="h-8 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200">
                  <X size={13} />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={handleStartEdit} className="h-8 gap-1.5 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200">
                  <Edit3 size={13} /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={deletePostMutation.isPending}
                  className="h-8 text-red-600 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                >
                  {deletePostMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status selector — editável com clique */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Status do Post
            </Label>
            <div className="flex flex-wrap gap-2">
              {STATUS_ORDER.map(status => {
                const cfg = STATUS_CONFIG[status];
                const isActive = selectedPost.status === status;
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer",
                      isActive
                        ? cn(cfg.bg, cfg.color, "shadow-sm ring-1", cfg.ring)
                        : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-300"
                    )}
                  >
                    <span className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      isActive ? cfg.dot : "bg-slate-200 dark:bg-slate-700"
                    )} />
                    {cfg.label}
                    {isActive && <CheckCircle2 size={11} className="ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drive Link */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Link do Drive / Conteúdo
            </Label>
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  value={(editData as any).driveLink ?? ""}
                  onChange={e => setEditData(prev => ({ ...prev, driveLink: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                />
              </div>
            ) : selectedPost.driveLink ? (
              <button
                onClick={handleOpenDrive}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors w-full text-sm font-medium"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Link2 size={14} className="text-white" />
                </div>
                <span className="truncate flex-1 text-left">{selectedPost.driveLink}</span>
                <ExternalLink size={14} className="flex-shrink-0 text-blue-500" />
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-sm">
                <Link2 size={14} />
                Nenhum link adicionado
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Descrição / Briefing
            </Label>
            {isEditing ? (
              <Textarea
                value={(editData as any).description ?? ""}
                onChange={e => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="text-sm resize-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-blue-500/20"
                placeholder="Descreva o conteúdo do post..."
              />
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800 transition-colors">
                {selectedPost.description || <span className="text-slate-400 italic">Sem descrição</span>}
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              <FileText size={12} className="inline mr-1" />
              Legenda / Caption
            </Label>
            {isEditing ? (
              <Textarea
                value={(editData as any).caption ?? ""}
                onChange={e => setEditData(prev => ({ ...prev, caption: e.target.value }))}
                rows={3}
                className="text-sm resize-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                placeholder="Legenda para publicação..."
              />
            ) : selectedPost.caption ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800 whitespace-pre-wrap transition-colors">
                {selectedPost.caption}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl px-4 py-3 text-sm text-slate-400 italic border border-dashed border-slate-200 dark:border-slate-700">
                Nenhuma legenda adicionada
              </div>
            )}
          </div>

          {/* Hashtags */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              <Hash size={12} className="inline mr-1" />
              Hashtags
            </Label>
            {isEditing ? (
              <Input
                value={(editData as any).hashtags ?? ""}
                onChange={e => setEditData(prev => ({ ...prev, hashtags: e.target.value }))}
                placeholder="#hashtag1 #hashtag2..."
                className="text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              />
            ) : selectedPost.hashtags ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedPost.hashtags.split(" ").filter(Boolean).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-xs font-medium shadow-sm transition-all"
                    style={{
                      backgroundColor: `${client.brandColor}20`,
                      color: client.brandColor,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">Nenhuma hashtag</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              <AlertCircle size={12} className="inline mr-1" />
              Observações Internas
            </Label>
            {isEditing ? (
              <Textarea
                value={(editData as any).notes ?? ""}
                onChange={e => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="text-sm resize-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                placeholder="Notas internas, pendências..."
              />
            ) : selectedPost.notes ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-200 leading-relaxed border border-amber-100 dark:border-amber-900/30 transition-colors">
                {selectedPost.notes}
              </div>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">Sem observações</p>
            )}
          </div>

          {/* Metadata */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center">
                <Circle size={8} className="inline mr-1 opacity-50" />
                Criado: {new Date(selectedPost.createdAt).toLocaleDateString("pt-BR")} às {new Date(selectedPost.createdAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                {selectedPost.createdBy?.name && <span className="ml-1 text-slate-500 font-medium">por {selectedPost.createdBy.name}</span>}
              </span>
              <span className="flex items-center">
                Atualizado: {new Date(selectedPost.updatedAt).toLocaleDateString("pt-BR")} às {new Date(selectedPost.updatedAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                {selectedPost.updatedBy?.name && <span className="ml-1 text-slate-500 font-medium">por {selectedPost.updatedBy.name}</span>}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
