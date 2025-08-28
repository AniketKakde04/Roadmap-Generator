
export interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'documentation' | 'course' | 'tool' | 'other';
}

export interface Step {
  title: string;
  description: string;
  resources: Resource[];
}

export interface Roadmap {
  title: string;
  description: string;
  steps: Step[];
}

export interface ProjectSuggestion {
  title: string;
  description: string;
  reasoning: string;
}