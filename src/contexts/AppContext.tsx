"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Client, Post, PostStatus, DayOfWeek, CreateClientDTO, CreatePostDTO } from "@/lib/types";
import { toast } from "sonner";
import { nanoid } from "nanoid";

interface AppState {
  clients: Client[];
  posts: Post[];
  selectedClientFilter: string | null; // null = todos
  selectedStatusFilter: PostStatus | null;
  currentWeekOffset: number; // 0 = semana atual, -1 = semana passada, etc.
  selectedPost: Post | null;
  isPostModalOpen: boolean;
  isClientModalOpen: boolean;
  editingClient: Client | null;
  isAddPostModalOpen: boolean;
  addPostDay: DayOfWeek | null;

  // Profile Actions
  isAccountModalOpen: boolean;
}

interface AppContextValue extends AppState {
  // Client actions
  addClient: (client: CreateClientDTO) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  openClientModal: (client?: Client) => void;
  closeClientModal: () => void;

  // Post actions
  addPost: (post: CreatePostDTO) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  updatePostStatus: (id: string, status: PostStatus) => void;
  openPostModal: (post: Post) => void;
  closePostModal: () => void;
  openAddPostModal: (day: DayOfWeek) => void;
  closeAddPostModal: () => void;

  // Filter actions
  setClientFilter: (clientId: string | null) => void;
  setStatusFilter: (status: PostStatus | null) => void;
  navigateWeek: (direction: "prev" | "next" | "current") => void;

  // Account Modal
  openAccountModal: () => void;
  closeAccountModal: () => void;

  // Computed
  filteredPosts: Post[];
  getClientById: (id: string) => Client | undefined;
  getWeekDates: () => { key: DayOfWeek; date: Date; label: string; isToday: boolean }[];

  // App state
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedClientFilter, setSelectedClientFilter] = useState<string | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<PostStatus | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const [addPostDay, setAddPostDay] = useState<DayOfWeek | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [clientsRes, postsRes] = await Promise.all([
          fetch("/api/clients").then(r => r.json()),
          fetch("/api/posts").then(r => r.json())
        ]);

        if (clientsRes.success) setClients(clientsRes.data);
        if (postsRes.success) setPosts(postsRes.data);
      } catch (error) {
        toast.error("Erro ao carregar os dados.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const addClient = useCallback(async (client: CreateClientDTO) => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(client),
      });
      const data = await res.json();
      if (data.success) {
        setClients(prev => [...prev, data.data]);
        toast.success("Agência adicionada!");
      } else throw new Error();
    } catch {
      toast.error("Erro ao adicionar agência");
    }
  }, []);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    // Optimistic UI update
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    try {
      await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch {
      toast.error("Erro ao atualizar agência");
      // Mudar back? Muito complexo pra MVP, ok no toast
    }
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    setPosts(prev => prev.filter(p => p.clientId !== id));

    try {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
    } catch {
      toast.error("Erro ao excluir agência");
    }
  }, []);

  const openClientModal = useCallback((client?: Client) => {
    setEditingClient(client ?? null);
    setIsClientModalOpen(true);
  }, []);

  const closeClientModal = useCallback(() => {
    setIsClientModalOpen(false);
    setEditingClient(null);
  }, []);

  const addPost = useCallback(async (post: CreatePostDTO) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => [...prev, data.data]);
      } else throw new Error();
    } catch {
      toast.error("Erro ao adicionar post");
    }
  }, []);

  const updatePost = useCallback(async (id: string, updates: Partial<Post>) => {
    // Optimistic Update
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
    setSelectedPost(prev => prev?.id === id ? { ...prev, ...updates } : prev);

    try {
      await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch {
      toast.error("Erro ao atualizar post");
    }
  }, []);

  const deletePost = useCallback(async (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setIsPostModalOpen(false);
    setSelectedPost(null);

    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
    } catch {
      toast.error("Erro ao excluir post");
    }
  }, []);

  const updatePostStatus = useCallback((id: string, status: PostStatus) => {
    updatePost(id, { status });
  }, [updatePost]);

  const openPostModal = useCallback((post: Post) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  }, []);

  const closePostModal = useCallback(() => {
    setIsPostModalOpen(false);
    setSelectedPost(null);
  }, []);

  const openAddPostModal = useCallback((day: DayOfWeek) => {
    setAddPostDay(day);
    setIsAddPostModalOpen(true);
  }, []);

  const closeAddPostModal = useCallback(() => {
    setIsAddPostModalOpen(false);
    setAddPostDay(null);
  }, []);

  const openAccountModal = useCallback(() => setIsAccountModalOpen(true), []);
  const closeAccountModal = useCallback(() => setIsAccountModalOpen(false), []);

  const setClientFilter = useCallback((clientId: string | null) => {
    setSelectedClientFilter(clientId);
  }, []);

  const setStatusFilter = useCallback((status: PostStatus | null) => {
    setSelectedStatusFilter(status);
  }, []);

  const navigateWeek = useCallback((direction: "prev" | "next" | "current") => {
    setCurrentWeekOffset(prev => {
      if (direction === "current") return 0;
      if (direction === "prev") return prev - 1;
      return prev + 1;
    });
  }, []);

  const getClientById = useCallback((id: string) => {
    return clients.find(c => c.id === id);
  }, [clients]);

  const getWeekDates = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday...
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + currentWeekOffset * 7);

    const days: { key: DayOfWeek; date: Date; label: string; isToday: boolean }[] = [];
    const dayKeys: DayOfWeek[] = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
    const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const isToday = date.toDateString() === today.toDateString();
      days.push({
        key: dayKeys[i],
        date,
        label: dayLabels[i],
        isToday,
      });
    }
    return days;
  }, [currentWeekOffset]);

  const filteredPosts = posts.filter(post => {
    if (selectedClientFilter && post.clientId !== selectedClientFilter) return false;
    if (selectedStatusFilter && post.status !== selectedStatusFilter) return false;
    return true;
  });

  return (
    <AppContext.Provider value={{
      clients,
      posts,
      selectedClientFilter,
      selectedStatusFilter,
      currentWeekOffset,
      selectedPost,
      isPostModalOpen,
      isClientModalOpen,
      editingClient,
      isAddPostModalOpen,
      addPostDay,
      isAccountModalOpen,
      addClient,
      updateClient,
      deleteClient,
      openClientModal,
      closeClientModal,
      addPost,
      updatePost,
      deletePost,
      updatePostStatus,
      openPostModal,
      closePostModal,
      openAddPostModal,
      closeAddPostModal,
      setClientFilter,
      setStatusFilter,
      navigateWeek,
      openAccountModal,
      closeAccountModal,
      filteredPosts,
      getClientById,
      getWeekDates,
      isLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
