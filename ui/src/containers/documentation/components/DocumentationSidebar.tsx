import { Button } from '@ikim-ui/ui-components/primitive/button';
import { BookOpen, ChevronRight } from 'lucide-react';

interface SidebarItem {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface DocumentationSidebarProps {
  items: SidebarItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function DocumentationSidebar({
  items,
  activeSection,
  onSectionChange,
}: DocumentationSidebarProps) {
  return (
    <div className="lg:w-64 flex-shrink-0">
      <div className="sticky top-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Documentation
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Complete guide to using AIANO
          </p>
        </div>

        <nav className="space-y-1">
          {items.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => onSectionChange(item.id)}
            >
              {item.icon}
              {item.title}
              {activeSection === item.id && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}
