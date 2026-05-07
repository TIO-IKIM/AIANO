import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { Badge } from '@ikim-ui/ui-components/primitive/badge';
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
  Users,
  Zap,
  Shield,
  BookOpen,
} from 'lucide-react';

export const Route = createFileRoute('/_layout/about')({
  component: RouteComponent,
});

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'What is AIANO?',
    answer:
      'AIANO (AI Augmented anNOtation) is a specialized annotation tool designed specifically for information retrieval tasks. It implements an AI-augmented workflow that seamlessly integrates human expertise with LLM capabilities, accelerating annotation through AI assistance while maintaining quality through human oversight.',
    category: 'General',
  },
  {
    id: '2',
    question: 'How does AIANO help with data annotation?',
    answer:
      'AIANO enables annotators to leverage AI suggestions while retaining full control over annotation decisions. It uses configurable AIANO Blocks that operate in three modes: Plain Mode (manual input), AI Solo Mode (AI-generated content with human review), and Human-AI Collaborative Mode (AI synthesizes multiple sources while humans can accept, modify, or override suggestions).',
    category: 'Features',
  },
  {
    id: '3',
    question: 'What are AIANO blocks?',
    answer:
      'AIANO Blocks are configurable input/output components that model annotation tasks. Each block operates in one of three modes representing varying levels of human-AI collaboration: Plain Mode (no AI assistance), AI Solo Mode (AI generates content based on system prompts), and Human-AI Collaborative Mode (AI draws from multiple sources including annotations, user-defined fields, and other blocks).',
    category: 'Features',
  },
  {
    id: '4',
    question: 'What is the workflow for creating datasets?',
    answer:
      'The workflow comprises three phases: (1) Project Creation - configure metadata, define schemas, set annotation levels, and design tasks using AIANO Blocks; (2) Configuration - connect blocks to LLMs and upload JSON documents; (3) Annotation - iteratively highlight text, generate content with AI assistance, review, edit, and export datasets with full provenance.',
    category: 'Getting Started',
  },
  {
    id: '5',
    question: 'What are annotation levels?',
    answer:
      'AIANO supports configurable annotation levels for highlighting text with different categories (e.g., "important", "distracting"). These provide contextual information for downstream tasks and help structure the annotation process.',
    category: 'Features',
  },
  {
    id: '6',
    question: 'How do I export my annotated data?',
    answer:
      'You can export datasets in JSON format with question-answer-passage triplets, IDs, and span positions. Projects can also be exported in .aiano format, which encapsulates all configurations for reproducibility and sharing.',
    category: 'Export',
  },
  {
    id: '7',
    question: 'What LLM providers does AIANO support?',
    answer:
      'AIANO supports any LLM provider following OpenAI API standards, including commercial services (e.g., OpenAI, Anthropic) and local deployments such as vLLM for efficient inference, enabling cost-effective, high-throughput workflows.',
    category: 'Integration',
  },
  {
    id: '8',
    question: 'How does AIANO compare to other annotation tools?',
    answer:
      'In our user study, AIANO nearly doubled annotation speed compared to Label Studio while being easier to use. It reduced cognitive load, with participants completing tasks 40% faster while achieving higher retrieval accuracy.',
    category: 'General',
  },
];

const categories = [
  'All',
  'General',
  'Features',
  'Integration',
  'Export',
  'Getting Started',
];

function RouteComponent() {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFAQs =
    selectedCategory === 'All'
      ? faqData
      : faqData.filter((faq) => faq.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">AIANO</h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              AI-Augmented Annotation tool designed specifically for information
              retrieval tasks. AIANO tightly integrates human expertise with LLM
              assistance to accelerate dataset creation while maintaining quality
              through human oversight.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Zap className="w-4 h-4 mr-2" />
                AI-Native
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Users className="w-4 h-4 mr-2" />
                Human-AI Collaboration
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Shield className="w-4 h-4 mr-2" />
                Information Retrieval
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Research-Validated
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose AIANO?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed specifically for information retrieval annotation with
              research-validated effectiveness in speed, usability, and accuracy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>AI-Augmented Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Leverage LLM assistance to generate content from highlighted
                  passages and existing annotations while retaining full control to
                  accept, modify, or override AI suggestions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>40% Faster Annotation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  In controlled user studies, participants completed tasks 40%
                  faster with AIANO compared to traditional tools, while reporting
                  lower cognitive load and higher usability.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Higher Retrieval Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AIANO improves retrieval performance with higher precision,
                  recall, and F1 scores, producing datasets that better capture
                  relevant information while filtering out noise.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Flexible AIANO Blocks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create custom annotation schemas with configurable blocks
                  operating in Plain, AI Solo, or Human-AI Collaborative modes,
                  tailored to your specific annotation requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Info className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Full-Text Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Integrated full-text search across and within documents
                  streamlines document discovery and helps ensure comprehensive
                  coverage of relevant information.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Flexible LLM Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Support for any OpenAI API-compatible LLM provider, including
                  commercial services and local deployments like vLLM for
                  cost-effective, high-throughput workflows.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about AIANO and how it streamlines
              annotation for information retrieval tasks.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="mb-2"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExpanded(faq.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {faq.category}
                      </Badge>
                      <h3 className="text-lg font-semibold text-left">
                        {faq.question}
                      </h3>
                    </div>
                    {expandedItems.includes(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                {expandedItems.includes(faq.id) && (
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Create high-quality information retrieval datasets faster with
              AI-augmented annotation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="px-8"
                onClick={() => navigate({ to: '/projects/new' })}
              >
                Start Your First Project
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8"
                onClick={() => navigate({ to: '/docs' })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
