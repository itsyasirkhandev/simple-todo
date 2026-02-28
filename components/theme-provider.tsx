/*
 * File Name:     theme-provider.tsx
 * Description:   Provider for next-themes to handle dark/light mode.
 * Author:        Antigravity
 * Created Date:  2024-02-28
 */

"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
