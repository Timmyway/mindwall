export interface ImageBank {
    resources: ImageBankResource[];
    meta: ImageBankMeta;
}

export interface ImageBankAuthor {
    name: string;
    avatar: string;
    profile_url: string;
}

export interface ImageBankResource {
    id: number;
    title: string;
    url: string;
    filename: string;
    image_source_url: string;
    author: ImageBankAuthor;
    orientation: ImageBankOrientation;
}

export interface ImageBankOptions {
    page?: number;
    limit?: number;
    term?: string;
}

export interface ImageBankMeta {
    current_page: number;
	per_page: number;
	last_page: number;
	total: number;
	clean_search: boolean;
}

export type ImageBankOrientation = 'horizontal' | 'vertical' | 'square' | 'panoramic';
