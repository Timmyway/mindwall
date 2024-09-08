export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
}

interface Permission {
    thematic: {
        view: oolean;
    }
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
        permissions: Permission;
    };
};
