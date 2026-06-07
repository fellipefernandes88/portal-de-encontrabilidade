import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';

export interface SeoConfig {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article';
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  setTags(config: SeoConfig): void {
    const fullTitle = `${config.title} | ${environment.portal.name}`;
    const image = config.image ?? environment.portal.defaultImage;
    const type = config.type ?? 'website';

    this.title.setTitle(fullTitle);

    this.meta.updateTag({
      name: 'description',
      content: config.description,
    });

    this.meta.updateTag({
      name: 'robots',
      content: 'index, follow',
    });

    this.meta.updateTag({
      property: 'og:site_name',
      content: environment.portal.name,
    });

    this.meta.updateTag({
      property: 'og:title',
      content: fullTitle,
    });

    this.meta.updateTag({
      property: 'og:description',
      content: config.description,
    });

    this.meta.updateTag({
      property: 'og:image',
      content: image,
    });

    this.meta.updateTag({
      property: 'og:url',
      content: config.url,
    });

    this.meta.updateTag({
      property: 'og:type',
      content: type,
    });

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });

    this.meta.updateTag({
      name: 'twitter:title',
      content: fullTitle,
    });

    this.meta.updateTag({
      name: 'twitter:description',
      content: config.description,
    });

    this.meta.updateTag({
      name: 'twitter:image',
      content: image,
    });

    this.setCanonical(config.url);
  }

  setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  setJsonLd(id: string, data: object): void {
    const oldScript = this.document.getElementById(id);

    if (oldScript) {
      oldScript.remove();
    }

    const script = this.document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);

    this.document.head.appendChild(script);
  }
}