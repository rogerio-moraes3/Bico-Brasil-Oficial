import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";

import { fadeInUp } from "@/lib/animations";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] shadow-sm hover:shadow-md [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 border border-transparent shadow-[0_12px_30px_-20px_hsl(var(--xp-primary-glow))]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-[image:var(--gradient-gold)] text-[hsl(var(--xp-gold-foreground))] border border-transparent font-semibold shadow-[0_4px_16px_-4px_hsl(var(--xp-gold)/0.45)] hover:shadow-[0_6px_20px_-4px_hsl(var(--xp-gold)/0.60)] hover:brightness-105 active:brightness-95",
      },

      size: {
        default: "h-11 min-h-[44px] px-4 py-2",
        sm: "h-10 min-h-[44px] rounded-lg px-3",
        lg: "h-12 min-h-[48px] rounded-xl px-8",
        icon: "h-11 w-11 min-h-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  animateOnMount?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, animateOnMount = true, ...props }, ref) => {
    if (asChild) {
      const Comp = Slot;
      return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
    }

    return (
      <motion.button
        {...(animateOnMount ? fadeInUp({ duration: 0.32, distance: 10 }) : {})}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
