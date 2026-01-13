import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Props = React.ComponentProps<typeof Button> & {
  variant?: 'solid' | 'outline';
  size?: 'default' | 'lg' | 'sm';
};

export default function PrimaryButton({ className, size = 'default', ...props }: Props) {
  // Map old size prop names to class names compatible with the design system
  const sizeClass = size === 'lg' ? 'h-14 px-6 text-lg' : size === 'sm' ? 'h-10 px-3 text-sm' : 'h-12 px-4 text-base';

  return <Button className={cn('w-full', sizeClass, className)} {...props} />;
} 
