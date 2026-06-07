import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { Notice } from '../models/notice.model';
import { SeoService } from './seo.service';

@Injectable({
  providedIn: 'root',
})
export class SchemaService {
  private readonly seo = inject(SeoService);

  setWebsiteSchema(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: environment.portal.name,
      url: environment.portal.url,
      description: environment.portal.description,
      publisher: {
        '@type': 'Organization',
        name: environment.portal.name,
        logo: {
          '@type': 'ImageObject',
          url: environment.portal.logo,
        },
      },
    };

    this.seo.setJsonLd('website-schema', schema);
  }

  setOrganizationSchema(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'NewsMediaOrganization',
      name: environment.portal.name,
      url: environment.portal.url,
      logo: {
        '@type': 'ImageObject',
        url: environment.portal.logo,
      },
      description: environment.portal.description,
    };

    this.seo.setJsonLd('organization-schema', schema);
  }

  setHomePageSchema(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: environment.portal.name,
      description: environment.portal.description,
      url: `${environment.portal.url}/public`,
      isPartOf: {
        '@type': 'WebSite',
        name: environment.portal.name,
        url: environment.portal.url,
      },
    };

    this.seo.setJsonLd('homepage-schema', schema);
  }

  setNewsItemListSchema(
    notices: Array<{ notice: Notice; imageUrl: string }>
  ): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Últimas notícias - ${environment.portal.name}`,
      itemListElement: notices.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${environment.portal.url}/public/notices/${item.notice.slug}`,
        item: {
          '@type': 'NewsArticle',
          headline: item.notice.title,
          description: item.notice.description,
          image: item.imageUrl,
          datePublished: item.notice.created_at,
          dateModified: item.notice.updated_at ?? item.notice.created_at,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${environment.portal.url}/public/notices/${item.notice.slug}`,
          },
        },
      })),
    };

    this.seo.setJsonLd('home-news-list-schema', schema);
  }

  setNewsArticleSchema(notice: Notice, imageUrl: string, canonicalUrl: string): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: notice.title,
      description: notice.description,
      image: [imageUrl],
      datePublished: notice.created_at,
      dateModified: notice.updated_at ?? notice.created_at,
      author: {
        '@type': 'Organization',
        name: environment.portal.name,
      },
      publisher: {
        '@type': 'Organization',
        name: environment.portal.name,
        logo: {
          '@type': 'ImageObject',
          url: environment.portal.logo,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
    };

    this.seo.setJsonLd('news-article-schema', schema);
  }

  setBreadcrumbSchema(items: Array<{ name: string; url: string }>): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    this.seo.setJsonLd('breadcrumb-schema', schema);
  }
}