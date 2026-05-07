import {
  ProjectConfig,
  AIANOBlock,
  AnnotationLevel,
  DatasetField,
} from '../../types';

export interface AianoBlocksSectionProps {
  config: ProjectConfig;
  newAianoBlock: Partial<AIANOBlock>;
  onNewAianoBlockChange: (block: Partial<AIANOBlock>) => void;
  onAddAianoBlock: () => void;
  onRemoveAianoBlock: (index: number) => void;
}

export interface DatasetFieldsSectionProps {
  config: ProjectConfig;
  newField: Partial<DatasetField>;
  onNewFieldChange: (field: Partial<DatasetField>) => void;
  onAddField: () => void;
  onRemoveField: (index: number) => void;
}

export interface AnnotationLevelsSectionProps {
  config: ProjectConfig;
  newAnnotationLevel: Partial<AnnotationLevel>;
  onNewAnnotationLevelChange: (level: Partial<AnnotationLevel>) => void;
  onAddAnnotationLevel: () => void;
  onRemoveAnnotationLevel: (index: number) => void;
  onUpdateAnnotationLevel: (
    index: number,
    level: Partial<AnnotationLevel>
  ) => void;
}
