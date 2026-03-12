"use client";

// Social Media Calendar Pro — PostModal Component
// Design: Studio Criativo — painel lateral deslizante com detalhes do post

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useQueryClient } from "@tanstack/react-query";
import { PostStatus, STATUS_CONFIG, POST_TYPE_CONFIG, DAYS_OF_WEEK } from "@/lib/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2, RotateCcw, Copy, CalendarPlus,
  ArrowRight, Share2, Eye, ShieldAlert,
  Save, Trash2, Calendar, Clock,
  FileText, Hash, Link2, ExternalLink, Activity, Info, AlertCircle, Circle, CheckCircle2,
  Mail, Send, MailCheck, Image, Play, LayoutGrid, Music, Youtube, Linkedin, Twitter, Edit3, X
} from "lucide-react";
import { CommentsSection } from "./CommentsSection";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Image, Play, Clock, LayoutGrid, Music, Youtube, Linkedin, Twitter,
};

const STATUS_ORDER: PostStatus[] = ["rascunho", "em_producao", "pronto", "publicado", "cancelado"];

type PostVersionData = {
  savedAt: string;
  savedBy?: { name: string } | null;
  title: string | null;
  description: string | null;
  caption: string | null;
  hashtags: string | null;
  status: string;
};

export function PostModal() {
  const { selectedPost, isPostModalOpen, closePostModal, updatePost, deletePost, getClientById, clients, updatePostMutation, deletePostMutation } = useApp();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<typeof selectedPost>>({});

  // PostVersion state
  const [version, setVersion] = useState<PostVersionData | null>(null);
  const [versionLoading, setVersionLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Fetch version whenever modal opens with a post

  // ShareLink state
  const [shareLoading, setShareLoading] = useState(false);
  const [activeShareLink, setActiveShareLink] = useState<{ id: string, token: string } | null>(null);

  // Email sending state
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  const fetchShareLinks = async (postId: string) => {
    try {
      const res = await fetch(`/api/share-links`);
      const json = await res.json();
      if (json.success && json.data) {
        // Encontra se esse post tem um link
        const postLink = json.data.find((l: any) => l.postId === postId);
        if (postLink) {
          setActiveShareLink(postLink);
        } else {
          setActiveShareLink(null);
        }
      }
    } catch { } // Ignora erro silenciosamente   
  };
  useEffect(() => {
    if (!selectedPost || !isPostModalOpen) {
      setVersion(null);
      setShowEmailInput(false);
      setEmailTo("");
      return;
    }
    setVersionLoading(true);
    fetch(`/api/posts/${selectedPost.id}/version`)
      .then(r => r.json())
      .then(res => setVersion(res.data ?? null))
      .catch(() => setVersion(null))
      .finally(() => setVersionLoading(false));

    fetchShareLinks(selectedPost.id);
  }, [selectedPost?.id, isPostModalOpen]);

  // Função pra abrir Link Publico
  const handleOpenPublicView = (token: string) => {
    window.open(`/p/${token}`, '_blank');
  };

  if (!selectedPost) return null;

  const dbClient = getClientById(selectedPost.clientId);
  const client = dbClient || ({
    id: "unknown", name: "Cliente Removido", brandColor: "#94a3b8", logoInitials: "?", logoUrl: undefined
  } as any);

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
    // Reload version after edit
    setTimeout(() => {
      fetch(`/api/posts/${selectedPost.id}/version`)
        .then(r => r.json())
        .then(res => setVersion(res.data ?? null))
        .catch(() => { });
    }, 500);
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
    deletePost(selectedPost.id);
    toast.success("Post excluído");
  };

  const handleOpenDrive = () => {
    if (selectedPost.driveLink) {
      window.open(selectedPost.driveLink, "_blank");
    }
  };

  const handleRestore = async () => {
    if (!version) return;
    setRestoring(true);
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}/version`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success("Versão anterior restaurada!");
        // Recarrega o post na lista
        queryClient?.invalidateQueries({ queryKey: ["posts"] });
        closePostModal();
      } else {
        toast.error("Erro ao restaurar versão");
      }
    } catch {
      toast.error("Erro ao restaurar versão");
    } finally {
      setRestoring(false);
    }
  };

  const handleCreateShareLink = async () => {
    if (!selectedPost) return;
    setShareLoading(true);
    try {
      const res = await fetch("/api/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: selectedPost.id, allowComments: true }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Link de aprovação gerado!");
        setActiveShareLink(json.data);
      } else {
        toast.error(json.error || "Erro ao gerar link");
      }
    } catch {
      toast.error("Erro ao gerar link");
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!activeShareLink) return;
    const url = `${window.location.origin}/p/${activeShareLink.token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleSendEmail = async () => {
    if (!activeShareLink || !emailTo) return;
    setEmailSending(true);
    try {
      const res = await fetch("/api/share-links/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: activeShareLink.token, emailTo }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("E-mail com o link enviado para aprovação!");
        setShowEmailInput(false);
        setEmailTo("");
      } else {
        toast.error(json.error || "Erro ao disparar e-mail");
      }
    } catch {
      toast.error("Erro ao disparar e-mail");
    } finally {
      setEmailSending(false);
    }
  };

  const formatSafeDate = (d?: string) => {
    if (!d) return "N/A";
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return "N/A";
      return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return "N/A";
    }
  };

  return (
    <Dialog open={isPostModalOpen} onOpenChange={open => !open && closePostModal()}>
      <DialogContent className="max-w-2xl max-h-[90dvh] md:max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 pointer-events-auto">
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
            <DialogDescription className="sr-only">
              Painel de visualização e edição desta postagem.
            </DialogDescription>
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
                <Button size="sm" onClick={handleSaveEdit} disabled={updatePostMutation.isPending} className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white dark:text-white shadow-md transition-all active:scale-95 pointer-events-auto">
                  {updatePostMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Salvar
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={updatePostMutation.isPending} className="h-8 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 pointer-events-auto">
                  <X size={13} />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={handleStartEdit} className="h-8 gap-1.5 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 pointer-events-auto cursor-pointer relative z-50">
                  <Edit3 size={13} /> Editar
                </Button>

                {/* Botão de Compartilhar */}
                {client.name !== "Cliente Removido" && (
                  <div className="relative flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={activeShareLink ? handleCopyShareLink : handleCreateShareLink}
                      disabled={shareLoading}
                      className={cn(
                        "h-8 gap-1.5 pointer-events-auto cursor-pointer transition-colors",
                        activeShareLink
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                          : "hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200"
                      )}
                    >
                      {shareLoading ? <Loader2 size={13} className="animate-spin" /> : (
                        activeShareLink ? <Copy size={13} /> : <Share2 size={13} />
                      )}
                      {activeShareLink ? "Copiar Link" : "Compartilhar"}
                    </Button>

                    {activeShareLink && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowEmailInput(prev => !prev)}
                        className={cn(
                          "h-8 w-8 p-0 pointer-events-auto cursor-pointer transition-colors",
                          showEmailInput
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            : "hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200"
                        )}
                      >
                        <Send size={13} />
                      </Button>
                    )}
                  </div>
                )}

                <ConfirmActionDialog
                  title="Excluir postagem?"
                  description={`Tem certeza que deseja excluir o post "${selectedPost.title}"? Esta ação não pode ser desfeita.`}
                  actionText="Excluir"
                  onConfirm={handleDelete}
                  disabled={deletePostMutation.isPending}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={deletePostMutation.isPending}
                    className="h-8 text-red-600 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 pointer-events-auto cursor-pointer relative z-50"
                  >
                    {deletePostMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </Button>
                </ConfirmActionDialog>
              </>
            )}
          </div>
        </div>

        {/* Restore version banner */}
        {version && !isEditing && (
          <div className="flex items-center justify-between px-6 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/40 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <RotateCcw size={13} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300 truncate">
                Versão anterior salva em {formatSafeDate(version.savedAt)}
                {version.savedBy?.name && <span className="font-medium"> por {version.savedBy.name}</span>}
              </p>
            </div>
            <ConfirmActionDialog
              title="Restaurar versão anterior?"
              description="O estado atual do post será salvo como 'versão anterior', e o post voltará para como estava antes da última edição. Você pode alternar entre versões a qualquer momento."
              actionText="Restaurar"
              onConfirm={handleRestore}
              disabled={restoring}
            >
              <button
                disabled={restoring}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors active:scale-95 disabled:opacity-50"
              >
                {restoring ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                Restaurar
              </button>
            </ConfirmActionDialog>
          </div>
        )}

        {/* Input Rápido para Enviar por E-mail */}
        {showEmailInput && activeShareLink && !isEditing && (
          <div className="px-6 py-3 bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-800/20 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex-1 min-w-0 w-full relative">
              <Send className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={14} />
              <Input
                placeholder="E-mails (Múltiplos sep. virgula: a@a.com, b@b.com)"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="pl-9 h-9 text-sm border-blue-200 focus-visible:ring-blue-500/30 dark:border-blue-800/40 bg-white dark:bg-slate-900"
                disabled={emailSending}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendEmail()
                }}
              />
            </div>
            <Button
              size="sm"
              onClick={handleSendEmail}
              disabled={!emailTo || emailSending || !emailTo.includes("@")}
              className="h-9 w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {emailSending ? <Loader2 size={14} className="animate-spin mr-2" /> : "Enviar"}
            </Button>
          </div>
        )}

        {/* Wrapper de Colunas Master */}
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row">

          {/* Scrollable content (Esquerda) */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 pb-12 sm:pb-5 space-y-5">
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
              <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                <span className="flex items-center">
                  <Circle size={8} className="inline mr-1 opacity-50" />
                  Criado: {formatSafeDate(selectedPost.createdAt)}
                  {selectedPost.createdBy?.name && <span className="ml-1 text-slate-500 font-medium">por {selectedPost.createdBy.name}</span>}
                </span>
                <span className="flex items-center">
                  Atualizado: {formatSafeDate(selectedPost.updatedAt)}
                  {selectedPost.updatedBy?.name && <span className="ml-1 text-slate-500 font-medium">por {selectedPost.updatedBy.name}</span>}
                </span>
              </div>
            </div>
          </div> {/* Fim da esquerda */}

          {/* Right Column: Comments & Feedback */}
          <div className="w-full md:w-[450px] flex-shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
            <CommentsSection
              postId={selectedPost.id}
              isAgencyView={true}
              brandColor={client.brandColor}
            />
          </div>

        </div> {/* Fim do Wrapper de 2 paineis */}
      </DialogContent>
    </Dialog>
  );
}
