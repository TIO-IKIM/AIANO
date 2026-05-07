import React from 'react';
import { Search } from 'lucide-react';

interface DocumentListEmptyProps {
  searchTerm: string;
  hasDocuments: boolean;
}

export const DocumentListEmpty: React.FC<DocumentListEmptyProps> = ({
  searchTerm,
  hasDocuments,
}) =>
  // Always return null - no empty state messages
  null;
