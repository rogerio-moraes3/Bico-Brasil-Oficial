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
      <SelectTrigger className="h-10 bg-white border border-[#E0E0E0] text-[#333333] rounded-md">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white border border-[#E0E0E0] rounded-md">
        {children}
      </SelectContent>
    </Select>
  );
}
