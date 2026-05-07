import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';

export function ProjectSetupSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Project Setup</h2>
        <p className="text-lg text-muted-foreground">
          Configure your annotation project following AIANO's three-phase
          workflow: Project Creation, Configuration, and Annotation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 1: Project Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Project Metadata</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                <strong>Project Name:</strong> Choose a descriptive name for
                your annotation project
              </li>
              <li>
                <strong>Description:</strong> Add details about your annotation
                goals and dataset purpose
              </li>
              <li>
                <strong>Tags:</strong> Organize projects with searchable tags
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Input/Output Schemas</h4>
            <p className="text-muted-foreground mb-2">
              Define custom schemas using JSON structure. Only document ID and
              subject ID are mandatory fields. Add additional fields of any
              type to support varying document types.
            </p>
            <div className="bg-muted p-3 rounded text-sm font-mono">
              {`{
  "document_id": "required",
  "subject_id": "required",
  "custom_field_1": "any type",
  "custom_field_2": "any type"
}`}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Annotation Levels</h4>
            <p className="text-muted-foreground">
              Configure annotation levels for highlighting text with different
              categories (e.g., "important", "distracting") to provide
              contextual information for downstream tasks.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AIANO Blocks - Core Concept</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            AIANO models annotation tasks as configurable input/output blocks.
            Each block operates in one of three modes representing varying
            levels of human-AI collaboration:
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-gray-400 pl-4">
              <h4 className="font-semibold mb-1">Plain Mode</h4>
              <p className="text-sm text-muted-foreground">
                Receives no automatic input sources. The AI performs no
                operations, and the human annotator manually writes all content
                from scratch. Example: A free-text Comment Block for writing
                notes directly.
              </p>
            </div>

            <div className="border-l-4 border-blue-400 pl-4">
              <h4 className="font-semibold mb-1">AI Solo Mode</h4>
              <p className="text-sm text-muted-foreground">
                Takes pre-defined system prompts as input. The AI automatically
                generates content based on these prompts, which the human
                annotator can then review and refine. Example: A Question Block
                that auto-generates boilerplate comprehension questions.
              </p>
            </div>

            <div className="border-l-4 border-green-400 pl-4">
              <h4 className="font-semibold mb-1">
                Human-AI Collaborative Mode
              </h4>
              <p className="text-sm text-muted-foreground">
                Draws from multiple input sources: existing annotations,
                user-defined fields, other blocks, and system prompts. The AI
                generates outputs by synthesizing these sources, and the human
                annotator can accept, modify, or override suggestions. Example:
                An Answer Block that draws from a Question Block, highlighted
                passages, and document metadata to generate candidate answers.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> You can create custom block types for
              specialized annotation needs beyond the pre-defined block types.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phase 2: Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">LLM Provider Setup</h4>
            <p className="text-muted-foreground mb-2">
              Connect your AIANO Blocks to any LLM provider following OpenAI
              API standards:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Commercial services (e.g., OpenAI, Anthropic)</li>
              <li>
                Local deployments (e.g., vLLM for cost-effective,
                high-throughput workflows)
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Document Upload</h4>
            <p className="text-muted-foreground">
              Upload documents in JSON format following your defined input
              schema. The system supports flexible document structures based on
              your custom field definitions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
