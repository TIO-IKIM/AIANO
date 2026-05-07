import { GettingStartedSection } from './sections/GettingStartedSection';
import { ProjectSetupSection } from './sections/ProjectSetupSection';
import { AnnotationWorkflowSection } from './sections/AnnotationWorkflowSection';
import { CollaborationSection } from './sections/CollaborationSection';
import { ExportImportSection } from './sections/ExportImportSection';
import { ApiIntegrationSection } from './sections/ApiIntegrationSection';
import { TroubleshootingSection } from './sections/TroubleshootingSection';

interface DocumentationContentProps {
  activeSection: string;
}

export function DocumentationContent({
  activeSection,
}: DocumentationContentProps) {
  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return <GettingStartedSection />;
      case 'project-setup':
        return <ProjectSetupSection />;
      case 'annotation-workflow':
        return <AnnotationWorkflowSection />;
      case 'collaboration':
        return <CollaborationSection />;
      case 'export-import':
        return <ExportImportSection />;
      case 'api-integration':
        return <ApiIntegrationSection />;
      case 'troubleshooting':
        return <TroubleshootingSection />;
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {renderContent()}
      </div>
    </div>
  );
}
