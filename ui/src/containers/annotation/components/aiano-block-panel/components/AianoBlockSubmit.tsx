import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { AianoBlockSubmitProps } from '../types/AianoBlockPanel.types';

export const AianoBlockSubmit: React.FC<AianoBlockSubmitProps> = ({
  canSubmit,
  validationMessage,
  onSubmit,
}) => (
  <div className="mt-6 pt-4 border-t border-border">
    <Button
      onClick={onSubmit}
      disabled={!canSubmit}
      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
    >
      <Check size={16} className="mr-2" />
      Submit Entry
    </Button>
    <p
      className={`text-xs mt-2 text-center ${
        canSubmit ? 'text-green-600' : 'text-muted-foreground'
      }`}
    >
      {validationMessage}
    </p>
  </div>
);
