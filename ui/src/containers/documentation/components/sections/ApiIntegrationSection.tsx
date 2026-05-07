import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
import { Badge } from '@ikim-ui/ui-components/primitive/badge';

export function ApiIntegrationSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">LLM Integration</h2>
        <p className="text-lg text-muted-foreground">
          AIANO supports any LLM provider following OpenAI API standards for
          flexible, cost-effective workflows.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supported LLM Providers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Connect AIANO to LLM providers that follow the OpenAI API standard:
          </p>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2">Commercial Services</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">OpenAI (GPT-4, GPT-3.5)</Badge>
                <Badge variant="secondary">Anthropic (Claude)</Badge>
                <Badge variant="secondary">Other OpenAI-compatible APIs</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Local Deployments</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">vLLM</Badge>
                <Badge variant="secondary">LocalAI</Badge>
                <Badge variant="secondary">
                  Self-hosted OpenAI-compatible servers
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Local deployments enable cost-effective, high-throughput
                workflows with data privacy control
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">LLM Provider Setup</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Configure your LLM provider connection in the Project
              Configuration phase:
            </p>

            <div className="bg-muted p-4 rounded space-y-2 text-sm">
              <div>
                <strong>API Endpoint:</strong>{' '}
                <code>https://api.openai.com/v1</code> (or your custom endpoint)
              </div>
              <div>
                <strong>API Key:</strong> Your provider's authentication key
              </div>
              <div>
                <strong>Model:</strong> Select model (e.g., gpt-4, claude-3,
                llama-70b)
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Block-Level Configuration</h4>
            <p className="text-sm text-muted-foreground">
              Each AIANO Block can be connected to the LLM provider with
              specific system prompts and generation parameters, enabling
              fine-tuned control over AI assistance for different annotation
              tasks.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
