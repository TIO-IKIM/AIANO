import {
  ProjectConfig,
  DatasetField,
  AnnotationLevel,
  AIANOBlock,
  AIInputSource,
} from '../../types';

export interface ProjectConfigFormState {
  config: Partial<ProjectConfig>;
  newField: Partial<DatasetField>;
  newTag: string;
  newAnnotationLevel: Partial<AnnotationLevel>;
  newAianoBlock: Partial<AIANOBlock>;
  newInputSource: Partial<AIInputSource>;
}
