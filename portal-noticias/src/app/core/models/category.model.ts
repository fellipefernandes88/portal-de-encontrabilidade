import { Notice } from './notice.model';

export interface Category {
    id: number;
    name: string;
    slug: string;
    notices?: Notice[];
}