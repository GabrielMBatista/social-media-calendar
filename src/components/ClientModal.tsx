"use client";

// Social Media Calendar Pro — ClientModal Component
// Design: Studio Criativo — modal de gestão de clientes com identidade visual

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Client } from "@/lib/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Palette, Upload, Instagram } from "lucide-react";

const PRESET_COLORS = [
  "#E91E8C", "#2563EB", "#D97706", "#059669", "#7C3AED",
  "#DC2626", "#0891B2", "#65A30D", "#EA580C", "#9333EA",
  "#0F172A", "#BE185D", "#1D4ED8", "#15803D", "#B45309",
];

export function ClientModal() {
  const { isClientModalOpen, closeClientModal, addClient, updateClient, editingClient } = useApp();

  const [form, setForm] = useState({
    name: "",
    brandColor: "#2563EB",
    brandColorSecondary: "",
    logoUrl: "",
    logoInitials: "",
    industry: "",
    instagramHandle: "",
    active: true,
  });

  useEffect(() => {
    if (editingClient) {
      setForm({
        name: editingClient.name,
        brandColor: editingClient.brandColor,
        brandColorSecondary: editingClient.brandColorSecondary ?? "",
        logoUrl: editingClient.logoUrl ?? "",
        logoInitials: editingClient.logoInitials,
        industry: editingClient.industry ?? "",
        instagramHandle: editingClient.instagramHandle ?? "",
        active: editingClient.active,
      });
    } else {
      setForm({
        name: "", brandColor: "#2563EB", brandColorSecondary: "",
        logoUrl: "", logoInitials: "", industry: "", instagramHandle: "", active: true,
      });
    }
  }, [editingClient, isClientModalOpen]);

  // Auto-generate initials from name
  const handleNameChange = (name: string) => {
    const words = name.trim().split(/\s+/);
    const initials = words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
    setForm(p => ({ ...p, name, logoInitials: p.logoInitials || initials }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Informe o nome do cliente"); return; }
    if (!form.logoInitials.trim()) { toast.error("Informe as iniciais"); return; }

    if (editingClient) {
      updateClient(editingClient.id, form);
      toast.success("Cliente atualizado!");
    } else {
      addClient(form);
      toast.success("Cliente adicionado!");
    }
    closeClientModal();
  };

  const previewInitials = form.logoInitials || form.name.slice(0, 2).toUpperCase() || "??";

  return (
    <Dialog open={isClientModalOpen} onOpenChange={open => !open && closeClientModal()}>
      <DialogContent className="max-w-lg max-h-[85dvh] flex flex-col overflow-hidden p-0 sm:p-6 pointer-events-auto">
        <DialogHeader className="px-6 pt-6 sm:px-0 sm:pt-0 pb-2 border-b sm:border-0 border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-lg font-bold">
            {editingClient ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription className="sr-only">Gerencie as informações e identidade visual do cliente aqui.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-2 pb-12 sm:pb-2 overflow-y-auto overflow-x-hidden flex-1">
          {/* Preview */}
          <div
            className="rounded-xl p-4 flex items-center gap-4 border"
            style={{
              background: `linear-gradient(135deg, ${form.brandColor}20 0%, ${form.brandColor}08 100%)`,
              borderColor: `${form.brandColor}40`,
            }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0"
              style={{ backgroundColor: form.brandColor }}
            >
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt="Logo"
                  className="w-full h-full rounded-xl object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : previewInitials}
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {form.name || "Nome do Cliente"}
              </p>
              {form.industry && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{form.industry}</p>
              )}
              {form.instagramHandle && (
                <p className="text-xs font-medium mt-0.5" style={{ color: form.brandColor }}>
                  {form.instagramHandle}
                </p>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Nome do Cliente *
            </Label>
            <Input
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Ex: Bella Estética"
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Initials + Industry row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Iniciais (2 letras)
              </Label>
              <Input
                value={form.logoInitials}
                onChange={e => setForm(p => ({ ...p, logoInitials: e.target.value.toUpperCase().slice(0, 2) }))}
                placeholder="BE"
                maxLength={2}
                className="font-bold text-center text-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Segmento
              </Label>
              <Input
                value={form.industry}
                onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}
                placeholder="Ex: Beleza & Estética"
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          {/* Instagram */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              <Instagram size={11} className="inline mr-1" />
              Instagram
            </Label>
            <Input
              value={form.instagramHandle}
              onChange={e => setForm(p => ({ ...p, instagramHandle: e.target.value }))}
              placeholder="@usuario"
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Logo URL */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              <Upload size={11} className="inline mr-1" />
              URL da Logo (opcional)
            </Label>
            <Input
              value={form.logoUrl}
              onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))}
              placeholder="https://exemplo.com/logo.png"
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Cole a URL de uma imagem. Se não informado, as iniciais serão usadas.
            </p>
          </div>

          {/* Brand Color */}
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              <Palette size={11} className="inline mr-1" />
              Cor da Marca
            </Label>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="color"
                value={form.brandColor}
                onChange={e => setForm(p => ({ ...p, brandColor: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
              />
              <Input
                value={form.brandColor}
                onChange={e => setForm(p => ({ ...p, brandColor: e.target.value }))}
                placeholder="#000000"
                className="font-mono text-sm w-32 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>
            {/* Preset colors */}
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setForm(p => ({ ...p, brandColor: color }))}
                  className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: form.brandColor === color ? "#1e293b" : "transparent",
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100 pb-6 sm:pb-2">
            <div>
              <p className="text-sm font-semibold text-slate-700">Cliente Ativo</p>
              <p className="text-xs text-slate-400">Aparece no calendário e filtros</p>
            </div>
            <Switch
              checked={form.active}
              onCheckedChange={v => setForm(p => ({ ...p, active: v }))}
            />
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.2)] mt-auto">
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button variant="outline" onClick={closeClientModal} className="w-full sm:w-auto pointer-events-auto">Cancelar</Button>
            <Button
              onClick={handleSubmit}
              style={{ backgroundColor: form.brandColor }}
              className="text-white dark:text-white hover:opacity-90 w-full sm:w-auto pointer-events-auto"
            >
              {editingClient ? "Salvar Alterações" : "Adicionar Cliente"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
