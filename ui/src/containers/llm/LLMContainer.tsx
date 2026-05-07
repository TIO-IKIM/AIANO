import { ReactNode } from 'react';
import { useLLM } from './hooks/useLLM';
import { LLMConfigPanel } from './components/LLMConfigPanel';
import { LLMConfig, LLMContext } from './types';

interface LLMContainerProps {
  selectedConfig?: LLMConfig;
  children: (llm: {
    config: LLMConfig;
    isGenerating: boolean;
    error: any;
    generateAnswer: (question: string, context: LLMContext[]) => Promise<any>;
    updateConfig: (config: Partial<LLMConfig>) => void;
    resetError: () => void;
    testConnection: () => Promise<boolean>;
    LLMConfigPanel: typeof LLMConfigPanel;
  }) => ReactNode;
}

export function LLMContainer({ children, selectedConfig }: LLMContainerProps) {
  const llm = useLLM();

  const generateAnswer = async (question: string, context: LLMContext[]) => {
    const configToUse = selectedConfig || llm.config;

    return llm.generateAnswer({
      question,
      context,
      config: configToUse,
    });
  };

  return (
    <>
      {children({
        ...llm,
        generateAnswer,
        testConnection: llm.testConnection,
        LLMConfigPanel,
      })}
    </>
  );
}

export default LLMContainer;
