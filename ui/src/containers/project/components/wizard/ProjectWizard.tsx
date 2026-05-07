import { useState } from 'react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { Card, CardContent } from '@ikim-ui/ui-components/primitive/card';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { ProjectConfig } from '../../types';
import { useProjectConfigForm } from '../hooks/useProjectConfigForm';
import { ProjectInfoStep } from './ProjectInfoStep';
import { DatasetFieldsStep } from './DatasetFieldsStep';
import { AnnotationLevelsStep } from './AnnotationLevelsStep';
import { AianoBlocksStep } from './AianoBlocksStep';

interface ProjectWizardProps {
  initialConfig?: Partial<ProjectConfig>;
  onSave: (config: ProjectConfig) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const STEPS = [
  {
    id: 'info',
    title: 'Project Info',
    description: 'Basic project information',
  },
  {
    id: 'dataset',
    title: 'Data Fields',
    description: 'Configure data structure',
  },
  {
    id: 'annotations',
    title: 'Annotation Levels',
    description: 'Define annotation types',
  },
  { id: 'blocks', title: 'AIANO Blocks', description: 'Set up AI blocks' },
];

export function ProjectWizard({
  initialConfig,
  onSave,
  onCancel,
  isSaving = false,
}: ProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const {
    state,
    updateConfig,
    updateNewField,
    updateNewTag,
    updateNewAnnotationLevel,
    updateNewAianoBlock,
    addField,
    removeField,
    addTag,
    removeTag,
    addAnnotationLevel,
    removeAnnotationLevel,
    addAianoBlock,
    removeAianoBlock,
  } = useProjectConfigForm(initialConfig);

  const handleSave = async () => {
    if (!state.config.name || !state.config.dataset?.name) {
      alert('Please fill in required fields (Project Name and Dataset Name)');
      return;
    }

    // Check for duplicate project name
    try {
      const { useProjectStore } = await import(
        '@/containers/project/stores/projectStore'
      );
      const { loadProjects } = useProjectStore.getState();
      await loadProjects();
      const existingProjects = useProjectStore.getState().projects;

      const projectExists = existingProjects.some(
        (project) =>
          project.name.toLowerCase() === state.config.name.toLowerCase()
      );

      if (projectExists) {
        alert(
          `A project with the name "${state.config.name}" already exists. Please choose a different name.`
        );
        return;
      }
    } catch (error) {
      console.error('Failed to check for duplicate project name:', error);
      // Continue with creation if check fails
    }

    const fullConfig: ProjectConfig = {
      id: state.config.id || `project_${Date.now()}`,
      name: state.config.name,
      description: state.config.description || '',
      dataset: {
        name: state.config.dataset.name,
        description: state.config.dataset.description,
        url: state.config.dataset.url,
        fields: state.config.dataset.fields || [],
        titleField: state.config.dataset.titleField,
      },
      tags: state.config.tags || [],
      annotationLevels: state.config.annotationLevels || [],
      aianoBlocks: state.config.aianoBlocks || [],
      createdAt: state.config.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(fullConfig);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Project Info
        return !!(state.config.name && state.config.dataset?.name);
      case 1: // Dataset Fields
        return true; // Optional step
      case 2: // Annotation Levels
        return true; // Optional step
      case 3: // AIANO Blocks
        return true; // Optional step
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);
  const isLastStep = currentStep === STEPS.length - 1;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProjectInfoStep
            config={state.config}
            onConfigChange={updateConfig}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            newTag={state.newTag}
            onNewTagChange={(tag) => updateNewTag(tag)}
          />
        );
      case 1:
        return (
          <DatasetFieldsStep
            config={state.config}
            onConfigChange={updateConfig}
            onAddField={addField}
            onRemoveField={removeField}
            newField={state.newField}
            onNewFieldChange={updateNewField}
          />
        );
      case 2:
        return (
          <AnnotationLevelsStep
            config={state.config}
            onConfigChange={updateConfig}
            onAddAnnotationLevel={addAnnotationLevel}
            onRemoveAnnotationLevel={removeAnnotationLevel}
            newAnnotationLevel={state.newAnnotationLevel}
            onNewAnnotationLevelChange={updateNewAnnotationLevel}
          />
        );
      case 3:
        return (
          <AianoBlocksStep
            config={state.config}
            onAddAianoBlock={addAianoBlock}
            onRemoveAianoBlock={removeAianoBlock}
            newAianoBlock={state.newAianoBlock}
            onNewAianoBlockChange={updateNewAianoBlock}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Create New Project</h1>
              <p className="text-muted-foreground">
                Step {currentStep + 1} of {STEPS.length}:{' '}
                {STEPS[currentStep].title}
              </p>
            </div>
            <Button variant="outline" onClick={onCancel} className="h-10">
              Cancel
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => goToStep(index)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    index === currentStep
                      ? 'border-primary bg-primary text-primary-foreground'
                      : index < currentStep
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>
                <div className="ml-3 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      index === currentStep
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${
                      index < currentStep
                        ? 'bg-green-500'
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="py-8">{renderStep()}</div>

      {/* Navigation Footer */}
      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="h-12 px-6"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-4">
              {isLastStep ? (
                <Button
                  onClick={handleSave}
                  disabled={!canProceed || isSaving}
                  className="h-12 px-8 bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed}
                  className="h-12 px-6"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
