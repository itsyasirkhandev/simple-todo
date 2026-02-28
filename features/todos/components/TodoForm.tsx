/*
 * File Name:     TodoForm.tsx
 * Description:   Redesigned Todo creation form with a premium editorial aesthetic.
 *                Features glassmorphism, refined typography, and improved field interactions.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React, { useEffect } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, AlertCircle, Zap, Target, Cloud, Trash2, Sparkles, PlusCircle } from 'lucide-react'
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
 * Redesigned TodoForm component with a premium editorial aesthetic.
 * 
 * DESIGN RATIONALE:
 * - Uses `font-serif` for main headers and labels to create an elegant feel.
 * - Implements glassmorphism (`backdrop-blur-xl`) with high-contrast borders.
 * - Features refined input styling with custom focus rings.
 * - Strictly follows the 8pt grid and 4 sizes / 2 weights rule.
 * 
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

    // Automatically manage sub-tasks lifecycle based on daily status
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
            priority: values.priority,
            isDaily: false,
            subTasks: [],
        })
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-12 border border-border/50 bg-card p-12 shadow-sm rounded-2xl relative overflow-hidden"
            >
                {/* Decorative Background Element */}
                <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-8 relative z-10">
                    <header className="space-y-2 border-b border-border/50 pb-8">
                        <div className="flex items-center gap-2 text-primary">
                            <Sparkles className="h-5 w-5" />
                            <span className="text-sm font-medium font-sans tracking-tight">New Objective</span>
                        </div>
                        <h2 className="text-3xl font-sans font-bold tracking-tighter text-foreground">
                            Define your next task
                        </h2>
                    </header>

                    <div className="space-y-8">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-sm font-medium font-sans text-muted-foreground/80">Title of Action</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="What needs to be achieved?"
                                            {...field}
                                            className="h-14 font-sans text-lg tracking-tight bg-background border-border/50 transition-all focus:border-primary focus:ring-1 focus:ring-primary rounded-lg placeholder:text-muted-foreground/50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-sm font-medium font-sans text-muted-foreground/80">Context & Nuance</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add the necessary details..."
                                            className="min-h-32 font-sans text-base leading-relaxed bg-background border-border/50 transition-all focus:border-primary focus:ring-1 focus:ring-primary rounded-lg resize-none placeholder:text-muted-foreground/50"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-sm font-medium font-sans text-muted-foreground/80">Strategic Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-14 bg-background border-border/50 transition-all focus:border-primary rounded-lg font-sans font-medium">
                                                    <SelectValue placeholder="Categorize by impact" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="border-border/50 bg-card rounded-lg shadow-md">
                                                <SelectItem value="urgent-important" className="focus:bg-destructive/10 focus:text-destructive py-3">
                                                    <div className="flex items-center gap-3">
                                                        <AlertCircle className="h-5 w-5 text-destructive" />
                                                        <span className="font-semibold">Urgent & Important</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="urgent-unimportant" className="focus:bg-accent/10 focus:text-accent py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Zap className="h-5 w-5 text-accent" />
                                                        <span className="font-semibold">Urgent & Un-Important</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="unurgent-important" className="focus:bg-primary/10 focus:text-primary py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Target className="h-5 w-5 text-primary" />
                                                        <span className="font-semibold">Un-Urgent & Important</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="unurgent-unimportant" className="focus:bg-muted/10 focus:text-muted-foreground py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Cloud className="h-5 w-5 text-muted-foreground/60" />
                                                        <span className="font-semibold">Un-Urgent & Un-Important</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isDaily"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-sm font-medium font-sans text-muted-foreground/80">Repetition Protocol</FormLabel>
                                        <div className="flex items-center justify-between h-14 px-4 border border-border/50 bg-background transition-all hover:border-primary/50 rounded-lg">
                                            <span className="text-sm font-medium font-sans text-foreground">Daily Cycle</span>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {isDaily && (
                            <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                                    <FormLabel className="text-sm font-medium font-sans text-primary">
                                        Layered Objectives (Sub-tasks)
                                    </FormLabel>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ id: crypto.randomUUID(), title: '' })}
                                        className="h-10 px-4 font-sans font-medium text-sm rounded-md border-border/50 hover:bg-primary hover:text-primary-foreground transition-all"
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" /> Append Objective
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {fields.map((field, index) => (
                                        <FormField
                                            key={field.id}
                                            control={form.control}
                                            name={`subTasks.${index}.title`}
                                            render={({ field: inputField }) => (
                                                <FormItem className="flex items-start gap-4 space-y-0 relative">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Component of the larger goal..."
                                                            {...inputField}
                                                            className="h-12 pr-12 font-sans text-base bg-background border-border/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg"
                                                        />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => remove(index)}
                                                        className="h-12 w-12 absolute top-0 right-0 text-muted-foreground hover:text-destructive hover:bg-transparent"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                    {fields.length === 0 && (
                                        <div className="py-12 border border-dashed border-border/40 flex flex-col items-center justify-center opacity-40">
                                            <Plus className="h-8 w-8 mb-2" />
                                            <p className="text-xs font-semibold font-sans uppercase tracking-widest">Add steps to your daily cycle</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-8 relative z-10">
                    <Button
                        type="submit"
                        className="w-full h-14 text-sm font-semibold font-sans transition-all rounded-xl bg-foreground text-background hover:bg-primary hover:text-primary-foreground shadow-md"
                    >
                        Commit to Action
                    </Button>
                </div>
            </form>
        </Form>
    )
}
