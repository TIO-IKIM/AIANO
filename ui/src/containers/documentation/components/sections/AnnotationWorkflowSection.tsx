import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
import { Target, FileText, CheckCircle, Search } from 'lucide-react';

export function AnnotationWorkflowSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Annotation Workflow</h2>
        <p className="text-lg text-muted-foreground">
          Phase 3: Iteratively annotate documents using AIANO's AI-augmented
          interface with integrated full-text search and LLM assistance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Annotation Interface</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The annotation interface comprises three main panels:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Left Panel</h4>
              <p className="text-sm text-muted-foreground">
                Document corpus with search and filtering capabilities for
                efficient navigation
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Center Panel</h4>
              <p className="text-sm text-muted-foreground">
                Highlighting interface with full-text search and annotation
                tools for text selection
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Right Panel</h4>
              <p className="text-sm text-muted-foreground">
                AIANO Blocks for AI-assisted content generation and annotation
                entry
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">Annotation Steps</h3>

        <div className="space-y-3">
          <div className="flex gap-4 items-start p-4 border rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">
                1. Select and Search Documents
              </h4>
              <p className="text-sm text-muted-foreground">
                Use the document corpus panel with integrated full-text search
                to locate relevant documents across your entire dataset. Search
                functionality helps ensure comprehensive coverage.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-4 border rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">2. Highlight Relevant Spans</h4>
              <p className="text-sm text-muted-foreground">
                Select text passages and highlight relevant sections using your
                configured annotation levels (e.g., evidence passages,
                supporting information). These highlights serve as input for
                AI-assisted content generation.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-4 border rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">
                3. Populate AIANO Blocks (Left-to-Right)
              </h4>
              <p className="text-sm text-muted-foreground">
                Work through AIANO Blocks. For blocks in
                Human-AI Collaborative Mode, the AI generates content from your
                highlighted passages and other inputs. Review, edit, accept, or
                override AI suggestions with full control over final
                annotations.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-4 border rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">
                4. Automatic Saving with Provenance
              </h4>
              <p className="text-sm text-muted-foreground">
                The system automatically saves annotations with full provenance
                metadata for the current entry as well as previous annotation
                entries for the project, ensuring reproducibility and
                traceability.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Features for IR Annotation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold mb-1">Full-Text Search</h4>
            <p className="text-sm text-muted-foreground">
              Search across and within documents to quickly locate relevant
              information. In user studies, 86.7% of participants found this
              feature useful for improved efficiency.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">AI-Assisted Generation</h4>
            <p className="text-sm text-muted-foreground">
              Generate candidate answers and annotations from highlighted
              passages using LLM assistance. 93.3% of participants found AI
              assistance useful, with 80% valuing the combination of search and
              AI features.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Multi-Document Navigation</h4>
            <p className="text-sm text-muted-foreground">
              Efficiently navigate between documents when annotations require
              information synthesis from multiple sources, essential for complex
              information retrieval tasks.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Human Oversight</h4>
            <p className="text-sm text-muted-foreground">
              Maintain full control over annotation decisions. Accept, modify,
              or override AI suggestions to ensure quality and accuracy while
              benefiting from AI acceleration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
