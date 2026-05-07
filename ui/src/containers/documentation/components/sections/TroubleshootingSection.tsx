import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
  import { ExternalLink } from 'lucide-react';

export function TroubleshootingSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Troubleshooting & Support</h2>
        <p className="text-lg text-muted-foreground">
          Get help and find resources for working with AIANO.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Help</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">GitHub Repository</h4>
            <p className="text-sm text-muted-foreground mb-2">
              AIANO is open source and available on GitHub. Report issues, ask
              questions, or browse existing discussions:
            </p>
            <a
              href="https://github.com/TIO-IKIM/AIANO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              github.com/TIO-IKIM/AIANO
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Contributing to AIANO
        </h4>
        <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
          AIANO is an open-source project. Contributions, bug reports, and
          feature requests are welcome on the GitHub repository. Help us improve
          annotation capabilities for information retrieval tasks!
        </p>
        <a
          href="https://github.com/TIO-IKIM/AIANO/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Open an Issue or Pull Request
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
