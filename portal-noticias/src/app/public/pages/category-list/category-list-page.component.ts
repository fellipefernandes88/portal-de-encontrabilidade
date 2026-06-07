import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { tap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { environment } from '../../../../environments/environment';
import { PublicNewsService } from '../../../core/services/public-news.service';
import { SeoService } from '../../../core/seo/seo.service';

@Component({
  selector: 'app-categories-list-page',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './category-list-page.component.html',
  styleUrl: './category-list-page.component.scss',
})
export class CategoriesListPageComponent {

  private readonly newsService = inject(PublicNewsService);

  private readonly seo = inject(SeoService);

  readonly categories$ = this.newsService.categories().pipe(

    tap(() => {
      this.seo.setTags({
        title: 'Notícias',
        description: 'Veja todas as notícias disponíveis no portal por assunto.',
        url: `${environment.portal.url}/noticias`,
        type: 'website',
      });
    })

  );
}