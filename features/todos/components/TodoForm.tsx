/*
 * File Name:     TodoForm.tsx
 * Description:   Form for creating and editing Todos.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, AlertCircle, Zap, Target, Cloud } from 'lucide-react'
import { todoSchema, TodoFormValues } from '../schemas/todo.schema'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

/**
 * Props for the TodoForm component.
 * @property {Function} onSubmit - Callback function executed when form is valid.
 * @property {Partial<TodoFormValues>} [defaultValues] - Initial state for editing.
 */
interface TodoFormProps {
    onSubmit: (data: TodoFormValues) => void
    defaultValues?: Partial<TodoFormValues>
}

/**
 * Form component for task creation, styled with premium blur effects and validation.
 * @param {TodoFormProps} props - Component properties.
 * @returns {JSX.Element} The rendered form.
 */
export function TodoForm({ onSubmit, defaultValues }: TodoFormProps) {
    const form = useForm<TodoFormValues>({
        resolver: zodResolver(todoSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: 'urgent-important',
            ...defaultValues,
        },
    })

    const handleFormSubmit = (values: TodoFormValues) => {
        onSubmit(values)
        form.reset({
            title: '',
            description: '',
            priority: values.priority, // Keep the same priority for quick adding
        })
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-6 rounded-none border-4 border-foreground bg-background p-6 shadow-xl"
            >
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Todo Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Completing my coding project" {...field} className="h-12 border-2 border-border bg-background text-base transition-all focus:border-foreground focus:ring-0 rounded-none" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Notes (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Completing my coding project"
                                        className="min-h-24 border-2 border-border bg-background transition-all focus:border-foreground focus:ring-0 rounded-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 border-2 border-border bg-background transition-all focus:border-foreground rounded-none">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="border-2 border-border bg-background rounded-none">
                                        <SelectItem value="urgent-important" className="focus:bg-destructive focus:text-destructive-foreground">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-destructive" />
                                                <span>Urgent & Important</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="urgent-unimportant" className="focus:bg-accent focus:text-accent-foreground">
                                            <div className="flex items-center gap-2">
                                                <Zap className="h-4 w-4 text-accent" />
                                                <span>Urgent & Not Important</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="unurgent-important" className="focus:bg-primary focus:text-primary-foreground">
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-primary" />
                                                <span>Not Urgent & Important</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="unurgent-unimportant" className="focus:bg-muted focus:text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Cloud className="h-4 w-4 text-muted-foreground" />
                                                <span>Not Urgent & Not Important</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full h-14 text-base font-semibold uppercase tracking-widest transition-all rounded-none hover:bg-foreground hover:text-background border-2 border-transparent">
                    <Plus className="mr-2 h-6 w-6" />
                    Add Todo
                </Button>
            </form>
        </Form>
    )
}
