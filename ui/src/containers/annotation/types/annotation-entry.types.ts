import { TextSpan } from './index';

/**
 * Type for AIANO block values based on block type
 */
export type AianoBlockValue = string | string[] | boolean;

/**
 * Type for block values map
 */
export type BlockValuesMap = { [blockId: string]: AianoBlockValue };

/**
 * Metadata that can be attached to annotation entries
 */
export interface AnnotationEntryMetadata {
  [key: string]: unknown;
}

/**
 * Structure of annotation entry data
 */
export interface AnnotationEntryData {
  highlights: TextSpan[];
  aiano_blocks: BlockValuesMap;
  metadata?: AnnotationEntryMetadata;
}

/**
 * Complete annotation entry structure from backend
 */
export interface AnnotationEntry {
  id: number;
  user_id: number;
  project_id: number;
  document_id: number;
  entry_data: AnnotationEntryData;
  entry_name: string;
  entry_notes: string;
  created_at: string;
  updated_at?: string;
}
