import React from 'react';
import { AianoBlockPanel as AianoBlockPanelComponent } from './aiano-block-panel/AianoBlockPanel';
import { AianoBlockPanelProps } from './aiano-block-panel/types/AianoBlockPanel.types';

export function AianoBlockPanel(props: AianoBlockPanelProps) {
  return <AianoBlockPanelComponent {...props} />;
}
