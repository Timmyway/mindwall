import { PageProps } from '@inertiajs/core';

export interface FlashMessages {
    success?: string; // Optional, as it may not always be present
    error?: string;   // Optional, as it may not always be present
}

export interface InertiaPageProps extends PageProps {
    flash: {
        [key: string]: string | undefined;
    };
    // Other properties...
}
