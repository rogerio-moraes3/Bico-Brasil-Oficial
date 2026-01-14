import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  children: React.ReactNode;
};

export default function StandardSelect({ value, onChange, placeholder = 'Selecione', children }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange?.(v)}>
      <SelectTrigger className="h-10 bg-[hsl(var(--input))] border border-border text-foreground rounded-md">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-popover border border-border rounded-md">
        {children}
      </SelectContent>
    </Select>
  );
}
