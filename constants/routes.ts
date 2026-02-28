/*
 * File Name:     routes.ts
 * Description:   Central registry for all application routes. 
 *                Use these constants for all `<Link href={...}>` and `router.push()` calls.
 */

export const ROUTES = {
    // Public Routes
    HOME: '/',
    JOURNAL: '/journal',

    // Auth Routes
    AUTH: {
        LOGIN: '/login',
        REGISTER: '/register',
        FORGOT_PASSWORD: '/forgot-password',
    },

    // Dashboard / App Routes (require authentication)
    DASHBOARD: {
        HOME: '/dashboard',
        SETTINGS: '/dashboard/settings',
        PROFILE: '/dashboard/profile',
    },

    // Admin Routes
    ADMIN: {
        HOME: '/admin',
        USERS: '/admin/users',
    },

    // Feature Fragments/ID links (Must be defined as constants)
    TODOS: {
        VIEW: '#matrix-view',
        CREATE: '#create-task-view',
    }
} as const;

/**
 * Helper to build dynamic routes.
 * Usage: buildRoute(ROUTES.USER.PROFILE, { id: '123' })
 */
export const buildRoute = (path: string, params: Record<string, string | number>) => {
    let route = path;
    for (const [key, value] of Object.entries(params)) {
        route = route.replace(`:${key}`, String(value));
    }
    return route;
};
