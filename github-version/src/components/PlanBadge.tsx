import { cn } from "@/lib/utils";

interface PlanBadgeProps {
    variant: "popular" | "recommended" | "best";
    className?: string;
}

export const PlanBadge = ({ variant, className }: PlanBadgeProps) => {
    const variants = {
        popular: {
            bg: "bg-slate-700",
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
            label: "⭐ MELHOR VALOR"
        }
    };

    const config = variants[variant];

    return (
        <div
            className={cn(
                "absolute top-0 right-0 rounded-bl-lg shadow-lg",
                "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider",
                config.bg,
                config.text,
                className
            )}
        >
            {config.label}
        </div>
    );
};
