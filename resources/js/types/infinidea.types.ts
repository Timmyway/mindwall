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
}
