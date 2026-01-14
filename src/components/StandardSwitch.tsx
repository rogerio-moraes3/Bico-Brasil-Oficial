import React from 'react';
import { Switch } from '@/components/ui/switch';

export default function StandardSwitch(props: any) {
  // We just ensure visual colors via className overrides
  return (
    <Switch {...props} className="h-6 w-12" />
  );
}
