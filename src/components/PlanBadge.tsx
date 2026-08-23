import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface PlanBadgeProps {
    variant: "popular" | "recommended" | "best";
    className?: string;
}

export const PlanBadge = ({ variant, className }: PlanBadgeProps) => {
    const variants = {
        popular: {
            bg: "bg-slate-800",
            text: "text-white",
            label: "POPULAR"
        },
        recommended: {
            bg: "bg-primary",
            text: "text-primary-foreground",
            label: "RECOMENDADO"
        },
        best: {
            bg: "bg-amber-500",
            text: "text-white",
            label: "MELHOR VALOR",
            icon: Star
        }
    };

    const config = variants[variant];
    const Icon = "icon" in config ? config.icon : null;

    return (
        <div
            className={cn(
                "absolute top-0 right-0 rounded-bl-lg shadow-lg",
                "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1",
                config.bg,
                config.text,
                className
            )}
        >
            {Icon && <Icon className="h-3 w-3" />}
            {config.label}
        </div>
    );
};
