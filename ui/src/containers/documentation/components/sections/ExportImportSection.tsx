import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';

export function ExportImportSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Export & Import</h2>
        <p className="text-lg text-muted-foreground">
          Export annotated datasets and projects for downstream applications and
          reproducibility.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dataset Export (JSON)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Export your annotated datasets in JSON format for integration with
            ML pipelines and downstream applications.
          </p>

          <div>
            <h4 className="font-semibold mb-2">JSON export includes:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                Question-answer-passage triplets (for IR/RAG evaluation)
              </li>
              <li>Document IDs and subject IDs</li>
              <li>Span positions for highlighted text</li>
              <li>All custom fields from your output schema</li>
              <li>Annotation metadata and provenance information</li>
            </ul>
          </div>

          <div className="bg-muted p-4 rounded text-sm font-mono">
            {`{
  "annotations": [
    {
      "question": "...",
      "answer": "...",
      "passages": [
        {
          "document_id": "...",
          "text": "...",
          "span": {"start": 0, "end": 100}
        }
      ],
      "metadata": {...}
    }
  ]
}`}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Export (.aiano format)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Export entire projects in .aiano format that encapsulates all
            configurations for reproducibility and sharing.
          </p>

          <div>
            <h4 className="font-semibold mb-2">.aiano format includes:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>All project configurations and metadata</li>
              <li>Input/output schema definitions</li>
              <li>AIANO Block configurations (modes, prompts, inputs)</li>
              <li>Annotation level settings</li>
              <li>LLM provider configurations</li>
              <li>Document corpus structure</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Import documents for annotation in JSON format following your defined
            input schema.
          </p>

          <div>
            <h4 className="font-semibold mb-2">Import requirements:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                JSON format matching your project's input schema
              </li>
              <li>
                Required fields: <code className="text-sm">document_id</code>,{' '}
                <code className="text-sm">subject_id</code>
              </li>
              <li>Additional custom fields as defined in your schema</li>
              <li>Flexible structure supporting varying document types</li>
            </ul>
          </div>

          <div className="bg-muted p-4 rounded text-sm font-mono">
            {`{
  "documents": [
    {
      "document_id": "doc_001",
      "subject_id": "subject_a",
      "text": "Document content...",
      "custom_field": "..."
    }
  ]
}`}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Use Cases for Export</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>RAG System Evaluation:</strong> Export question-answer-passage
                triplets for evaluating retrieval-augmented generation systems
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>ML Model Training:</strong> Use annotated datasets to train
                and fine-tune information retrieval models
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Research Reproducibility:</strong> Share .aiano project
                files to enable reproduction of annotation studies
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Pipeline Integration:</strong> Integrate JSON exports
                seamlessly with existing ML pipelines and workflows
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
