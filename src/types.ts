export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  originalPrompt?: string;
  aspectRatio: string;
  style?: string;
  createdAt: string;
  isFavorite?: boolean;
  likesCount?: number;
  tags?: string[];
}

export type AspectRatioOption = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface StyleOption {
  id: string;
  name: string;
  promptSuffix: string;
  previewUrl: string;
}

export interface PromptTemplate {
  title: string;
  prompt: string;
  category: string;
}
