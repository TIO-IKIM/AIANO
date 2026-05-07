import { useState } from 'react';
import {
  Play,
  Settings,
  Users,
  Download,
  HelpCircle,
  Code,
  Workflow,
} from 'lucide-react';
import { DocumentationSidebar } from './components/DocumentationSidebar';
import { DocumentationContent } from './components/DocumentationContent';

export function DocumentationContainer() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sidebarItems = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Play className="w-5 h-5" />,
    },
    {
      id: 'project-setup',
      title: 'Project Setup',
      icon: <Settings className="w-5 h-5" />,
    },
    {
      id: 'annotation-workflow',
      title: 'Annotation Workflow',
      icon: <Workflow className="w-5 h-5" />,
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'export-import',
      title: 'Export & Import',
      icon: <Download className="w-5 h-5" />,
    },
    {
      id: 'api-integration',
      title: 'API Integration',
      icon: <Code className="w-5 h-5" />,
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <HelpCircle className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DocumentationSidebar
            items={sidebarItems}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          <DocumentationContent activeSection={activeSection} />
        </div>
      </div>
    </div>
  );
}
