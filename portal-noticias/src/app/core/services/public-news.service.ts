import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';
import { HomeResponse } from '../models/home-response.model';
import { Notice } from '../models/notice.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class PublicNewsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  home(perCategory = 6) {
    return this.http
      .get<{ data: HomeResponse }>(`${this.apiUrl}/public`, {
        params: {
          per_category: String(perCategory),
        },
      })
      .pipe(map(response => response.data));
  }

  categories() {
    return this.http
      .get<{ data: Category[] }>(`${this.apiUrl}/public/categories`)
      .pipe(map(response => response.data));
  }

  category(slug: string, page = 1, perPage = 9) {
    return this.http.get<{
      category: Category;
      notices: PaginatedResponse<Notice>;
    }>(`${this.apiUrl}/public/categories/${slug}`, {
      params: {
        page: String(page),
        per_page: String(perPage),
      },
    });
  }

  notice(slug: string) {
    return this.http
      .get<{ data: Notice }>(`${this.apiUrl}/public/notices/${slug}`)
      .pipe(map(response => response.data));
  }

  latestNotices(page = 1, perPage = 12) {
    return this.http.get<PaginatedResponse<Notice>>(
      `${this.apiUrl}/public/notices`,
      {
        params: {
          page: String(page),
          per_page: String(perPage),
        },
      }
    );
  }

  search(term: string, perPage = 9) {
    return this.http.get<PaginatedResponse<Notice>>(
      `${this.apiUrl}/public/notices/search`,
      {
        params: {
          q: term,
          per_page: String(perPage),
        },
      }
    );
  }

  imageUrl(path?: string | null): string {

    if (!path) {
      return `${environment.portal.url}/assets/images/news-placeholder.webp`;
    }

    if (path.startsWith('http')) {
      return path;
    }

    return `${environment.storageUrl}/${path}`;
  }
}