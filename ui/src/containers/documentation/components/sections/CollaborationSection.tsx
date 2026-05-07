import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
import { ExternalLink } from 'lucide-react';

export function CollaborationSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Project Sharing</h2>
        <p className="text-lg text-muted-foreground">
          AIANO supports project export and sharing for collaboration and
          reproducibility.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Export (.aiano format)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Export entire projects in .aiano format that encapsulates all
            configurations for reproducibility and sharing with team members or
            collaborators.
          </p>

          <div>
            <h4 className="font-semibold mb-2">
              What's included in .aiano export:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Project metadata (name, description, tags)</li>
              <li>Input/output schema definitions</li>
              <li>Annotation level configurations</li>
              <li>AIANO Block configurations and modes</li>
              <li>LLM provider settings and prompts</li>
              <li>Document corpus structure</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reproducibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            AIANO's export format ensures complete reproducibility of annotation
            projects, enabling:
          </p>

          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>
              Sharing annotation configurations across research teams
            </li>
            <li>
              Replicating annotation workflows for consistency
            </li>
            <li>
              Archiving project setups for future reference
            </li>
            <li>
              Comparing different annotation strategies on the same corpus
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Provenance Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            All annotations are automatically saved with full provenance
            metadata, including annotation history, timestamp information, and
            configuration details, ensuring traceability and quality assurance
            throughout the annotation process.
          </p>
        </CardContent>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
        Future Collaboration Features
      </h4>
      <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
        Features like real-time collaborative editing, user roles, and
        inter-annotator agreement calculations are not yet implemented. AIANO is
        an open-source project and we welcome pull requests and contributions!
      </p>
      <a
        href="https://github.com/TIO-IKIM/AIANO"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
      >
        Contribute on GitHub
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
    </div>
  );
}
