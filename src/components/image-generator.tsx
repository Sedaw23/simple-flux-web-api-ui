'use client';

import { Model } from "@/lib/types";
import { useState, useEffect } from "react";
import { GenerationSettings } from "./image-generator/generation-settings";
import { ImageDisplay } from "./image-generator/image-display";
import { generateImage } from "@/lib/actions/generate-image";
import { useToast } from "@/hooks/use-toast";

const API_KEY_STORAGE_KEY = 'fal-ai-api-key';

interface ImageGeneratorProps {
  model: Model;
}

export function ImageGenerator({ model }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();
  const [parameters, setParameters] = useState<Record<string, any>>(() => {
    // Initialize parameters with default values from the model schema
    return Object.fromEntries(
      model.inputSchema
        .filter(param => param.default !== undefined)
        .map(param => [param.key, param.default])
    );
  });

  async function handleGenerate() {
    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your FAL.AI API key first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const allParameters = {
        ...parameters,
        prompt,
      };
      
      const response = await generateImage(model, allParameters, apiKey);
      
      if (response.success) {
        setResult(response.imageUrl);
        toast({
          title: "Image generated successfully",
          description: `Seed: ${response.seed}`,
        });
      } else {
        toast({
          title: "Generation failed",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl mx-auto">
      <GenerationSettings 
        prompt={prompt}
        setPrompt={setPrompt}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        model={model}
        parameters={parameters}
        setParameters={setParameters}
      />
      <ImageDisplay result={result} />
    </div>
  );
} 