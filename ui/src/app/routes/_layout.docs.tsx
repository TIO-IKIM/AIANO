import { createFileRoute } from '@tanstack/react-router';
import { DocumentationContainer } from '@/containers/documentation';

export const Route = createFileRoute('/_layout/docs')({
  component: RouteComponent,
});

function RouteComponent() {
  return <DocumentationContainer />;
}
