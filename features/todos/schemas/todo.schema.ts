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
    isDaily: z.boolean().default(false).optional(),
    subTasks: z.array(z.object({
        id: z.string(),
        title: z.string().min(1, 'Sub-task must not be empty').max(100, 'Sub-task is too long')
    })).optional(),
    dailyProgress: z.record(z.string(), z.object({
        isCompleted: z.boolean(),
        completedSubTasks: z.array(z.string()),
        notes: z.string()
    })).optional(),
});

/**
 * TypeScript type inferred from the todoSchema for use in forms.
 */
export type TodoFormValues = z.infer<typeof todoSchema>;

