import React from 'react';
import { DocumentList as DocumentListComponent } from './document-list/DocumentList';
import { DocumentListProps } from './document-list/types/DocumentList.types';

export const DocumentList: React.FC<DocumentListProps> = (props) => (
  <DocumentListComponent {...props} />
);
