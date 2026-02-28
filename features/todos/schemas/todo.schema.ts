/*
 * File Name:     todo.schema.ts
 * Description:   Zod schema for Todo validation.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

import { z } from 'zod';

/**
 * Zod schema for validating Todo form inputs.
 * Ensures title length, description constraints, and valid priority selection.
 */
export const todoSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long').max(100, 'Title is too long'),
    description: z.string().max(500, 'Description is too long').optional(),
    priority: z.enum([
        'urgent-important',
        'urgent-unimportant',
        'unurgent-important',
        'unurgent-unimportant',
    ]),
});

/**
 * TypeScript type inferred from the todoSchema for use in forms.
 */
export type TodoFormValues = z.infer<typeof todoSchema>;

