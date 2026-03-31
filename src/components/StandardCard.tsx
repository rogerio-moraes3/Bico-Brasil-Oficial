import React from 'react';
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

interface StandardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  animateOnMount?: boolean;
}

export default function StandardCard({
  children,
  className = '',
  animateOnMount = true,
  ...props
}: StandardCardProps) {
  return (
    <motion.div
      {...(animateOnMount ? fadeInUp({ duration: 0.36, distance: 14 }) : {})}
      className={`rounded-md border border-border bg-card text-card-foreground shadow-sm ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
