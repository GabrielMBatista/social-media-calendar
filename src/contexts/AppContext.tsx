"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client, Post, PostStatus, SocialTheme, DayOfWeek, CreateClientDTO, CreatePostDTO } from "@/lib/types";
import { toast } from "sonner";

interface AppState {
  clients: Client[];
  posts: Post[];
  selectedClientFilter: string | null;
  selectedStatusFilter: PostStatus | null;
  selectedSocialThemeFilter: SocialTheme | null;
  currentWeekOffset: number;
  selectedPost: Post | null;
  isPostModalOpen: boolean;
  isClientModalOpen: boolean;
  editingClient: Client | null;
  isAddPostModalOpen: boolean;
  addPostDay: DayOfWeek | null;
  isAccountModalOpen: boolean;
}

interface AppContextValue extends AppState {
  addClient: (client: CreateClientDTO) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  openClientModal: (client?: Client) => void;
  closeClientModal: () => void;
  addPost: (post: CreatePostDTO) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  updatePostStatus: (id: string, status: PostStatus) => void;
  openPostModal: (post: Post) => void;
  closePostModal: () => void;
  openAddPostModal: (day: DayOfWeek) => void;
  closeAddPostModal: () => void;
  setClientFilter: (clientId: string | null) => void;
  setStatusFilter: (status: PostStatus | null) => void;
  setSocialThemeFilter: (theme: SocialTheme | null) => void;
  navigateWeek: (direction: "prev" | "next" | "current") => void;
  jumpToDate: (dateStr: string) => void;
  openAccountModal: () => void;
  closeAccountModal: () => void;
  filteredPosts: Post[];
  getClientById: (id: string) => Client | undefined;
  getWeekDates: () => { key: DayOfWeek; date: Date; label: string; isToday: boolean }[];
  isLoading: boolean;
  updatePostMutation: any;
  deletePostMutation: any;
  addPostMutation: any;
}

const AppContext = createContext<AppContextValue | null>(null);

// Fetchers
const fetchClients = () => fetch("/api/clients").then(res => res.json()).then(d => d.data);
const fetchPosts = () => fetch("/api/posts").then(res => res.json()).then(d => d.data);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Queries
  const { data: clients = [], isLoading: isClientsLoading } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: fetchClients,
    staleTime: 5 * 60 * 1000,
  });

  const { data: posts = [], isLoading: isPostsLoading } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 0, // Sempre busca dados frescos quando invalidado (ex: após delete/update)
  });

  const isLoading = isClientsLoading || isPostsLoading;

  const [selectedClientFilter, setSelectedClientFilter] = useState<string | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<PostStatus | null>(null);
  const [selectedSocialThemeFilter, setSelectedSocialThemeFilter] = useState<SocialTheme | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const [addPostDay, setAddPostDay] = useState<DayOfWeek | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // --- CLIENT MUTATIONS ---

  const addClientMutation = useMutation({
    mutationFn: (newClient: CreateClientDTO) =>
      fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      }).then(r => r.json()),
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["clients"] });
        toast.success("Agência adicionada!");
        setIsClientModalOpen(false);
      } else {
        toast.error(data.error || "Erro ao adicionar agência");
      }
    },
    onError: () => toast.error("Erro ao adicionar agência")
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Client> }) =>
      fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["clients"] });
      const previousClients = queryClient.getQueryData<Client[]>(["clients"]);
      queryClient.setQueryData<Client[]>(["clients"], prev =>
        prev?.map(c => c.id === id ? { ...c, ...updates } : c)
      );
      return { previousClients };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["clients"], context?.previousClients);
      toast.error("Erro ao atualizar agência");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/clients/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["clients"] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const prevClients = queryClient.getQueryData<Client[]>(["clients"]);
      const prevPosts = queryClient.getQueryData<Post[]>(["posts"]);

      queryClient.setQueryData<Client[]>(["clients"], prev => prev?.filter(c => c.id !== id));
      queryClient.setQueryData<Post[]>(["posts"], prev => prev?.filter(p => p.clientId !== id));

      return { prevClients, prevPosts };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["clients"], context?.prevClients);
      queryClient.setQueryData(["posts"], context?.prevPosts);
      toast.error("Erro ao excluir agência");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  });

  // --- POST MUTATIONS ---

  const addPostMutation = useMutation({
    mutationFn: (newPost: CreatePostDTO) =>
      fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      }).then(r => r.json()),
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);

      // Optimistic update: insere o post temporário imediatamente
      const optimisticPost: Post = {
        id: `temp-${Date.now()}`,
        accountId: "",
        clientId: newPost.clientId,
        title: newPost.title,
        description: newPost.description ?? "",
        type: newPost.type,
        status: newPost.status,
        dayOfWeek: newPost.dayOfWeek,
        scheduledDate: newPost.scheduledDate ?? undefined,
        scheduledTime: newPost.scheduledTime ?? undefined,
        driveLink: newPost.driveLink ?? undefined,
        caption: newPost.caption ?? undefined,
        hashtags: newPost.hashtags ?? undefined,
        notes: newPost.notes ?? undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Post[]>(["posts"], prev => [...(prev ?? []), optimisticPost]);
      return { previousPosts };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Post adicionado ao calendário!");
      } else {
        toast.error(data.error || "Erro ao adicionar post");
      }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
      toast.error("Erro ao adicionar post");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Post> }) =>
      fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);

      queryClient.setQueryData<Post[]>(["posts"], prev =>
        prev?.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
      );

      if (selectedPost?.id === id) {
        setSelectedPost(prev => prev ? { ...prev, ...updates } : null);
      }

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
      toast.error("Erro ao atualizar post");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || "Erro ao excluir post");
      }
      return data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);
      queryClient.setQueryData<Post[]>(["posts"], prev => prev?.filter(p => p.id !== id));

      setIsPostModalOpen(false);
      setSelectedPost(null);

      return { previousPosts };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
      toast.error(err instanceof Error ? err.message : "Erro ao excluir post");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  });

  // --- CALLBACKS ---

  const addClient = useCallback((client: CreateClientDTO) => addClientMutation.mutate(client), [addClientMutation]);
  const updateClient = useCallback((id: string, updates: Partial<Client>) => updateClientMutation.mutate({ id, updates }), [updateClientMutation]);
  const deleteClient = useCallback((id: string) => deleteClientMutation.mutate(id), [deleteClientMutation]);

  const openClientModal = useCallback((client?: Client) => {
    setEditingClient(client ?? null);
    setIsClientModalOpen(true);
  }, []);

  const closeClientModal = useCallback(() => {
    setIsClientModalOpen(false);
    setEditingClient(null);
  }, []);

  const addPost = useCallback((post: CreatePostDTO) => addPostMutation.mutate(post), [addPostMutation]);
  const updatePost = useCallback((id: string, updates: Partial<Post>) => updatePostMutation.mutate({ id, updates }), [updatePostMutation]);
  const deletePost = useCallback((id: string) => deletePostMutation.mutate(id), [deletePostMutation]);

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

  const setSocialThemeFilter = useCallback((theme: SocialTheme | null) => {
    setSelectedSocialThemeFilter(theme);
  }, []);

  const navigateWeek = useCallback((direction: "prev" | "next" | "current") => {
    setCurrentWeekOffset(prev => {
      if (direction === "current") return 0;
      if (direction === "prev") return prev - 1;
      return prev + 1;
    });
  }, []);

  const jumpToDate = useCallback((dateStr: string) => {
    const selected = new Date(dateStr + "T12:00:00");
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    // Encontra a segunda-feira da semana de "today"
    const todayDay = today.getDay();
    const todayMonday = new Date(today);
    todayMonday.setDate(today.getDate() - (todayDay === 0 ? 6 : todayDay - 1));
    todayMonday.setHours(12, 0, 0, 0);

    // Encontra a segunda-feira da semana "selecionada"
    const selDay = selected.getDay();
    const selMonday = new Date(selected);
    selMonday.setDate(selected.getDate() - (selDay === 0 ? 6 : selDay - 1));
    selMonday.setHours(12, 0, 0, 0);

    // Calcula a diferença em semanas entre as duas segundas-feiras
    const diffTime = selMonday.getTime() - todayMonday.getTime();
    const diffWeeks = Math.round(diffTime / (1000 * 3600 * 24 * 7));

    setCurrentWeekOffset(diffWeeks);
  }, []);

  const getClientById = useCallback((id: string) => {
    return clients.find(c => c.id === id);
  }, [clients]);

  const getWeekDates = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
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
    if (selectedSocialThemeFilter && post.socialTheme !== selectedSocialThemeFilter) return false;
    return true;
  });

  return (
    <AppContext.Provider value={{
      clients,
      posts,
      selectedClientFilter,
      selectedStatusFilter,
      selectedSocialThemeFilter,
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
      setSocialThemeFilter,
      navigateWeek,
      jumpToDate,
      openAccountModal,
      closeAccountModal,
      filteredPosts,
      getClientById,
      getWeekDates,
      isLoading,
      updatePostMutation,
      deletePostMutation,
      addPostMutation,
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
