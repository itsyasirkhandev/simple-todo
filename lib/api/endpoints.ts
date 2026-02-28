/*
 * File Name:     endpoints.ts
 * Description:   Central registry for all API paths to prevent typos and ease refactoring.
 * Author:        Antigravity
 * Created Date:  2026-02-27
 */

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const API_ENDPOINTS = {
    // Example Endpoints (Add your endpoints here)
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
    },
    USERS: {
        LIST: '/users',
        DETAIL: (id: string) => `/users/${id}`,
    }
} as const;
