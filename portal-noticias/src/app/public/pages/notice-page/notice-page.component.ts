import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap, tap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { environment } from '../../../../environments/environment';
import { PublicNewsService } from '../../../core/services/public-news.service';
import { SeoService } from '../../../core/seo/seo.service';
import { SchemaService } from '../../../core/seo/schema.service';

@Component({
  selector: 'app-notice-page',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatChipsModule,
  ],
  templateUrl: './notice-page.component.html',
  styleUrl: './notice-page.component.scss',
})
export class NoticePageComponent {

  private readonly route = inject(ActivatedRoute);
  readonly newsService = inject(PublicNewsService);
  private readonly seo = inject(SeoService);
  private readonly schema = inject(SchemaService);

  readonly notice$ = this.route.paramMap.pipe(
    
    switchMap(params => this.newsService.notice(params.get('slug')!)),

    tap(notice => {
        
      const canonicalUrl = `${environment.portal.url}/public/noticias/${notice.slug}`;
      const imageUrl = this.newsService.imageUrl(notice.path_image);

      this.seo.setTags({
        title: notice.title,
        description: notice.description,
        image: imageUrl,
        url: canonicalUrl,
        type: 'article',
      });

      this.schema.setNewsArticleSchema(notice, imageUrl, canonicalUrl);

      this.schema.setBreadcrumbSchema([
        {
          name: 'Início',
          url: `${environment.portal.url}/public`,
        },
        {
          name: notice.category?.name ?? 'Categoria',
          url: `${environment.portal.url}/public/noticias/${notice.category?.slug}`,
        },
        {
          name: notice.title,
          url: canonicalUrl,
        },
      ]);
    })
  );
}
