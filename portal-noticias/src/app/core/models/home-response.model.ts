import { Category } from './category.model';
import { Notice } from './notice.model';

export interface HomeResponse {
  highlight: Notice | null;
  categories: Category[];
}