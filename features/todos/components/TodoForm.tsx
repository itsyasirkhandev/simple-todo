/*
 * File Name:     TodoForm.tsx
 * Description:   Form for creating and editing Todos.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React, { useEffect } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, AlertCircle, Zap, Target, Cloud, Trash2 } from 'lucide-react'
import { todoSchema, TodoFormValues } from '../schemas/todo.schema'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
            isDaily: false,
            subTasks: [],
            ...defaultValues,
        },
    })

    const { fields, append, remove } = useFieldArray({
        name: "subTasks",
        control: form.control,
    });

    const isDaily = useWatch({
        control: form.control,
        name: "isDaily",
    });

    // Automatically clear subTasks if isDaily is turned off
    useEffect(() => {
        if (!isDaily && fields.length > 0) {
            form.setValue('subTasks', [], { shouldValidate: true });
        }
    }, [isDaily, fields.length, form]);

    const handleFormSubmit = (values: TodoFormValues) => {
        onSubmit(values)
        form.reset({
            title: '',
            description: '',
            priority: values.priority, // Keep the same priority for quick adding
            isDaily: false,
            subTasks: [],
        })
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-6 border border-border/40 bg-card/50 p-6 shadow-sm rounded-none"
            >
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Todo Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Completing my coding project" {...field} className="h-12 border border-border/40 bg-background text-base transition-all focus:border-foreground focus:ring-0 rounded-none" />
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
                                        placeholder="Add context or details..."
                                        className="min-h-24 border border-border/40 bg-background transition-all focus:border-foreground focus:ring-0 rounded-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isDaily"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-none border border-border/40 p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base font-semibold uppercase tracking-widest text-foreground">
                                        Daily Task
                                    </FormLabel>
                                    <FormDescription className="text-sm text-muted-foreground">
                                        Track this task every day and manage sub-tasks.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        aria-readonly
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {isDaily && (
                        <div className="space-y-4 rounded-none border border-border/40 p-4 bg-muted/10">
                            <div className="flex items-center justify-between">
                                <FormLabel className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                                    Sub-Tasks
                                </FormLabel>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ id: crypto.randomUUID(), title: '' })}
                                    className="h-8 rounded-none border border-border/40 transition-all hover:bg-foreground hover:text-background"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <FormField
                                        key={field.id}
                                        control={form.control}
                                        name={`subTasks.${index}.title`}
                                        render={({ field: inputField }) => (
                                            <FormItem className="flex items-start gap-2 space-y-0 relative">
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Watch 1 video"
                                                        {...inputField}
                                                        className="h-10 pr-10 border border-border/40 bg-background transition-all focus:border-foreground focus:ring-0 rounded-none"
                                                    />
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    className="h-10 w-10 absolute top-0 right-0 text-muted-foreground hover:text-destructive hover:bg-transparent rounded-none"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                {fields.length === 0 && (
                                    <p className="text-sm text-muted-foreground/40 text-center py-4 border border-dashed border-border/40">
                                        No sub-tasks added.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 border border-border/40 bg-background transition-all focus:border-foreground rounded-none">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="border border-border/40 bg-background rounded-none">
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

                <Button type="submit" className="w-full h-12 text-sm font-semibold tracking-wide transition-all rounded-none border border-transparent">
                    <Plus className="mr-2 h-6 w-6" />
                    Add Todo
                </Button>
            </form>
        </Form>
    )
}
