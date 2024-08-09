export interface InfinideaParams {
    thematic: string;
    count: number;
	tones?: string[];
	segments?: string[];
	language?: string;
	engine: string;
	preheader?: boolean;
	examples?: string;
	temperature: number;
	topK: number;
	topP: number;
	restrictionLevel: string;
    base64Image?: string | null;
}

export interface TextGeneratorOption {
    base64Image?: string | null;
    engine: string;
}

type InfinideaEngine = 'photo-analyst' | 'descriptor';
