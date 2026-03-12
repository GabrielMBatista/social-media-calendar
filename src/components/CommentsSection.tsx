"use client";

import { useState, useEffect } from "react";
import { Send, User, CheckCircle2 } from "lucide-react";

type Comment = {
    id: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
    authorName?: string | null;
    authorEmail?: string | null;
    author: {
        id: string;
        name: string;
    } | null;
};

interface CommentsSectionProps {
    postId: string;
    token?: string; // Se vier com token, comporta-se em modo Público (ShareLink)
    brandColor?: string;
    isAgencyView?: boolean; // Define se estamos renderizando no Painel do PostModal
}

export function CommentsSection({
    postId,
    token,
    brandColor = "#3b82f6",
    isAgencyView = false,
}: CommentsSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Campos do Form Público
    const [content, setContent] = useState("");
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");

    // Qual aba o agente da agência está visualizando?
    const [activeTab, setActiveTab] = useState<"equipe" | "cliente">(
        isAgencyView ? "equipe" : "cliente"
    );

    const isPublicMode = !!token;

    useEffect(() => {
        fetchComments();
    }, [postId, token, activeTab]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            // Em modo público, a URL da API é diferente
            const url = isPublicMode
                ? `/api/public/post/${token}/comments`
                : `/api/posts/${postId}/comments`;

            const res = await fetch(url);
            if (!res.ok) throw new Error("Erro ao buscar comentários");

            const data = await res.json();
            if (data.success) {
                // Se o componente estiver no modo Agência, vamos separar a exibição na aba clicada
                let filtered = data.data as Comment[];
                if (isAgencyView) {
                    filtered = filtered.filter(c =>
                        activeTab === "equipe" ? c.isInternal : !c.isInternal
                    );
                }
                setComments(filtered);
            }
        } catch (error) {
            console.error("Failed to load comments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendComment = async (isApproval = false) => {
        if (!content.trim() && !isApproval) return;
        if (isPublicMode && (!guestName.trim() || !guestEmail.trim())) {
            alert("Por favor, preencha Nome e E-mail para poder comentar.");
            return;
        }

        setSending(true);
        try {
            const url = isPublicMode
                ? `/api/public/post/${token}/comments`
                : `/api/posts/${postId}/comments`;

            // Ação de Aprovação força uma mensagem padrão caso o content esteja vazio
            const finalContent = isApproval
                ? `[APROVADO] ${content || "A peça foi aprovada."}`
                : content;

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: finalContent,
                    isInternal: isAgencyView && activeTab === "equipe",
                    authorName: isPublicMode ? guestName : undefined,
                    authorEmail: isPublicMode ? guestEmail : undefined,
                    action: isApproval ? "APPROVE" : "COMMENT"
                }),
            });

            if (!res.ok) throw new Error("Erro ao enviar comentário");

            setContent("");
            fetchComments(); // Recarrega
        } catch (error) {
            console.error(error);
            alert("Falha ao enviar comentário.");
        } finally {
            setSending(false);
        }
    };

    const renderCommentTabs = () => {
        if (!isAgencyView) return null; // Cliente externo não tem abas, ele só vê a timeline dele

        return (
            <div className="flex border-b border-slate-200 mb-4">
                <button
                    onClick={() => setActiveTab("equipe")}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "equipe"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                >
                    Equipe Interna
                </button>
                <button
                    onClick={() => setActiveTab("cliente")}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "cliente"
                        ? "border-emerald-600 text-emerald-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                >
                    Feedbacks Cliente
                </button>
            </div>
        );
    };

    const renderCommentsList = () => {
        if (loading) return <div className="p-8 text-center text-sm text-slate-400 animate-pulse">Carregando mensagens...</div>;
        if (comments.length === 0) return <div className="p-8 text-center text-sm text-slate-400">Poxa, nenhum comentário por aqui ainda...</div>;

        return (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                {comments.map((comment) => {
                    const isClientSided = !comment.isInternal;
                    // Se estivermos em modo público, não queremos o selo de Agency, pq a agência conversando com o publico finge ser nativa do app
                    const displayName = comment.author?.name || comment.authorName || "Visitante";

                    return (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-slate-900">{displayName}</span>
                                    <span className="text-xs text-slate-400">
                                        {new Date(comment.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                        {" - "}
                                        {new Date(comment.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                                    </span>
                                </div>
                                <div className={`px-4 py-3 rounded-2xl text-sm inline-block max-w-[90%] break-words ${isClientSided && !isPublicMode
                                        ? "bg-emerald-50 text-emerald-900 border border-emerald-100" // Visão da agência olhando pro cliente
                                        : "bg-slate-100 text-slate-800" // Visão normal p/ tudo
                                    }`} style={isPublicMode ? { borderLeft: `3px solid ${brandColor}` } : {}}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {renderCommentTabs()}
            {renderCommentsList()}

            {/* Fomulário de Envio */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
                {isPublicMode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                            type="text"
                            placeholder="Seu Nome (Ex: João)"
                            className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-white outline-none focus:ring-1 focus:ring-slate-300"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Seu E-mail (Ex: joao@empresa.com.br)"
                            className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-white outline-none focus:ring-1 focus:ring-slate-300"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                        />
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={activeTab === "equipe" ? "Escreva algo internamente..." : "Escreva seu feedback ou ajuste..."}
                        className="w-full text-sm rounded-lg border border-slate-200 p-3 bg-white resize-none h-20 outline-none focus:ring-2 focus:ring-slate-200"
                    />

                    <div className="flex flex-col sm:flex-row gap-2 w-full mt-1">
                        <button
                            onClick={() => handleSendComment(false)}
                            disabled={sending || (!content.trim() && !isPublicMode)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                            {isPublicMode ? "Pedir Ajuste" : "Enviar Mensagem"}
                        </button>

                        {isPublicMode && (
                            <button
                                onClick={() => handleSendComment(true)}
                                disabled={sending || !guestName.trim() || !guestEmail.trim()}
                                className="flex-1 flex items-center justify-center gap-2 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors hover:opacity-90 disabled:opacity-50"
                                style={{ backgroundColor: brandColor }}
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Aprovar Peça
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
