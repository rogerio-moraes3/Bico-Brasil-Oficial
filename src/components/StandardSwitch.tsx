import React from 'react';
import { Switch } from '@/components/ui/switch';

export default function StandardSwitch(props: any) {
  // We just ensure visual colors via className overrides
  return (
    <Switch {...props} className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input" />
  );
}
