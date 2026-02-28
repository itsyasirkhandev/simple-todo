/*
 * File Name:     TechStack.tsx
 * Description:   Component showcasing the core technologies used in the template.
 * Author:        Antigravity
 * Created Date:  2026-02-27
 */

import { Badge } from "@/components/ui/badge";

const techItems = [
    { name: "Next.js 16", url: "https://nextjs.org/" },
    { name: "React 19", url: "https://react.dev/" },
    { name: "Tailwind CSS v4", url: "https://tailwindcss.com/" },
    { name: "GSAP 3.x", url: "https://greensock.com/" },
    { name: "shadcn/ui", url: "https://ui.shadcn.com/" },
    { name: "Radix UI", url: "https://www.radix-ui.com/" },
    { name: "TypeScript 5", url: "https://www.typescriptlang.org/" },
    { name: "Zod", url: "https://zod.dev/" },
];

export function TechStack() {
    return (
        <div className="anim-tech-stack flex flex-wrap justify-center gap-4">
            {techItems.map((tech) => (
                <Badge
                    key={tech.name}
                    variant="secondary"
                    className="anim-tech-badge h-8 px-4 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                    {tech.name}
                </Badge>
            ))}
        </div>
    );
}
