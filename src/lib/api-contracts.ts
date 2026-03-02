// Social Media Calendar Pro — API Contracts
// Contratos TypeScript para Comunicação Frontend <-> Backend

import { Account, User, Client, Post, PostStatus, PostType, DayOfWeek } from "./types";

/**
 * Padrão de Resposta da API
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

/**
 * Padrão de Paginação
 */
export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ==========================================
// CLIENTES (AGÊNCIAS/MARCAS)
// Base Route: /api/clients
// ==========================================

export namespace ClientAPI {
    // GET /api/clients
    // Headers: Authorization: Bearer <Token>
    export type GetListResponse = ApiResponse<Client[]>;

    // GET /api/clients/:id
    export type GetSingleResponse = ApiResponse<Client>;

    // POST /api/clients
    export interface CreateRequest {
        name: string;
        brandColor: string;
        brandColorSecondary?: string;
        logoUrl?: string;
        logoInitials?: string;
        industry?: string;
        instagramHandle?: string;
    }
    export type CreateResponse = ApiResponse<Client>;

    // PATCH /api/clients/:id
    export type UpdateRequest = Partial<CreateRequest> & { active?: boolean };
    export type UpdateResponse = ApiResponse<Client>;

    // DELETE /api/clients/:id
    export type DeleteResponse = ApiResponse<{ deleted: boolean }>;
}

// ==========================================
// POSTS (CALENDÁRIO)
// Base Route: /api/posts
// ==========================================

export namespace PostAPI {
    // GET /api/posts
    // Query Params: ?clientId=uuid&startDate=iso&endDate=iso&status=pronto
    export interface GetListQuery {
        clientId?: string;
        startDate?: string;
        endDate?: string;
        status?: PostStatus;
    }
    export type GetListResponse = ApiResponse<Post[]>;

    // GET /api/posts/:id
    export type GetSingleResponse = ApiResponse<Post>;

    // POST /api/posts
    export interface CreateRequest {
        clientId: string;
        title: string;
        description: string;
        type: PostType;
        status: PostStatus;
        dayOfWeek: DayOfWeek;
        scheduledDate?: string;
        scheduledTime?: string;
        driveLink?: string;
        caption?: string;
        hashtags?: string;
        notes?: string;
    }
    export type CreateResponse = ApiResponse<Post>;

    // PATCH /api/posts/:id
    export type UpdateRequest = Partial<CreateRequest>;
    export type UpdateResponse = ApiResponse<Post>;

    // DELETE /api/posts/:id
    export type DeleteResponse = ApiResponse<{ deleted: boolean }>;
}

// ==========================================
// AUTENTICAÇÃO E CONTA
// Base Route: /api/auth & /api/account
// ==========================================

export namespace AuthAPI {
    // GET /api/auth/me
    // Retorna os dados do usuário logado e sua agência correspondente
    export type GetMeResponse = ApiResponse<{
        user: User;
        account: Account;
    }>;
}
