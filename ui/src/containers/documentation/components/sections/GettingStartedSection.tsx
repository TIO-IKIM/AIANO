  import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';

export function GettingStartedSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Getting Started with AIANO</h2>
        <p className="text-lg text-muted-foreground">
          AIANO (AI Augmented anNOtation) is a specialized annotation tool
          designed specifically for information retrieval tasks. It implements
          an AI-augmented workflow that seamlessly integrates human expertise
          with LLM capabilities, accelerating annotation through AI assistance
          while maintaining quality through human oversight.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold">Create a Project</h3>
          </div>
          <p className="text-muted-foreground">
            Configure project metadata, define input/output schemas, set
            annotation levels, and design tasks using AIANO Blocks
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold">
              Configure LLM & Upload Documents
            </h3>
          </div>
          <p className="text-muted-foreground">
            Connect AIANO Blocks to your LLM provider (OpenAI API-compatible)
            and upload JSON documents for annotation
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold">Annotate with AI Assistance</h3>
          </div>
          <p className="text-muted-foreground">
            Iteratively highlight text, use full-text search, leverage
            AI-generated suggestions, and review/edit content with full control
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              4
            </div>
            <h3 className="text-xl font-semibold">Export Dataset</h3>
          </div>
          <p className="text-muted-foreground">
            Export annotations in JSON format with full provenance metadata or
            export entire projects in .aiano format for reproducibility
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Example: RAG Dataset Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border-l-4 border-primary pl-4 space-y-2">
            <div>
              <strong>Question Block:</strong> Plain Mode (manual entry)
            </div>
            <div>
              <strong>Answer Block:</strong> Human-AI Collaborative Mode
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 ml-4">
                <li>Input: Question + Highlighted passages</li>
                <li>AI: Generates candidate answer from context</li>
                <li>Human: Reviews, edits, accepts, or overrides</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
