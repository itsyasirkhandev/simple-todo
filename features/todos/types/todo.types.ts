/*
 * File Name:     todo.types.ts
 * Description:   Type definitions for the Todo application.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

/**
 * Defines the four quadrants of the Eisenhower Matrix.
 * 'urgent-important': Do first
 * 'unurgent-important': Schedule
 * 'urgent-unimportant': Delegate
 * 'unurgent-unimportant': Eliminate
 */
export type TodoPriority =
  | 'urgent-important'
  | 'urgent-unimportant'
  | 'unurgent-important'
  | 'unurgent-unimportant';

/**
 * Represents the daily progress for a specific date (YYYY-MM-DD).
 * @property {boolean} isCompleted - Whether the main daily task is completed.
 * @property {string[]} completedSubTasks - Array of completed sub-task IDs.
 * @property {string} notes - Optional daily notes.
 */
export interface DailyProgress {
  isCompleted: boolean;
  completedSubTasks: string[];
  notes: string;
}

/**
 * Represents a single Todo item in the application.
 * @property {string} id - Unique identifier (UUID).
 * @property {string} title - The main task description.
 * @property {string} [description] - Optional details about the task.
 * @property {TodoPriority} priority - The quadrant this task belongs to.
 * @property {boolean} isCompleted - Completion status.
 * @property {number} [order] - Sort order within a quadrant.
 * @property {number} createdAt - Creation timestamp.
 * @property {number} updatedAt - Last update timestamp.
 * @property {boolean} [isDaily] - Whether this is a repeating daily task.
 * @property {{ id: string, title: string }[]} [subTasks] - Optional sub-tasks.
 * @property {Record<string, DailyProgress>} [dailyProgress] - Progress record keyed by YYYY-MM-DD.
 */
export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: TodoPriority;
  isCompleted: boolean;
  order?: number;
  createdAt: number;
  updatedAt: number;
  isDaily?: boolean;
  subTasks?: { id: string; title: string }[];
  dailyProgress?: Record<string, DailyProgress>;
}

