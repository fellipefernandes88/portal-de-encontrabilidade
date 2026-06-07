import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, shareReplay, switchMap, tap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { environment } from '../../../../environments/environment';
import { PublicNewsService } from '../../../core/services/public-news.service';
import { SchemaService } from '../../../core/seo/schema.service';
import { SeoService } from '../../../core/seo/seo.service';

@Component({
    selector: 'app-category-page',
    standalone: true,
    imports: [
        AsyncPipe,
        DatePipe,
        RouterLink,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatPaginatorModule,
        MatProgressBarModule,
    ],
    templateUrl: './category-page.component.html',
    styleUrl: './category-page.component.scss',
})
export class CategoryPageComponent {

    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly newsService = inject(PublicNewsService);

    private readonly seo = inject(SeoService);
    private readonly schema = inject(SchemaService);

    private readonly perPage = 9;

    readonly categoryPage$ = combineLatest([

        this.route.paramMap,
        this.route.queryParamMap,

    ]).pipe(

        map(([params, queryParams]) => ({
            slug: params.get('slug')!,
            page: Number(queryParams.get('page') ?? 1),
        })),

        switchMap(({ slug, page }) =>
            this.newsService.category(slug, page, this.perPage) ),  
        tap(response => {
                    const categoryUrl = `${environment.portal.url}/noticias/${response.category.slug}`;

                    this.seo.setTags({
                        title: response.category.name,
                        description: `Veja as principais notícias da categoria ${response.category.name}.`,
                        url: categoryUrl,
                        type: 'website',
                    });

                    this.schema.setBreadcrumbSchema([
                {
                    name: 'Início',
                    url: `${environment.portal.url}/`,
                },
                {
                    name: 'Categorias',
                    url: `${environment.portal.url}/noticias`,
                },
                {
                    name: response.category.name,
                    url: categoryUrl,
                },
            ]);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    changePage(event: PageEvent, slug: string): void {
        const page = event.pageIndex + 1;

        this.router.navigate(['/noticias', slug], {
            queryParams: { page },
        });
    }
}