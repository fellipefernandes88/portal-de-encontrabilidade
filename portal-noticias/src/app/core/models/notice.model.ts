export interface Notice {
    id: number;
    category_id: number;
    title: string;
    description: string;
    notice?: string;
    path_image?: string | null;
    slug: string;
    created_at: string;
    updated_at?: string;
    category?: {
    id: number;
    name: string;
    slug: string;
    };
}