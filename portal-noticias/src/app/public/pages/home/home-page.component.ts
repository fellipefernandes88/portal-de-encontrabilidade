import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap, tap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { environment } from '../../../../environments/environment';
import { Notice } from '../../../core/models/notice.model';
import { PaginatedResponse } from '../../../core/models/pagination.model';
import { PublicNewsService } from '../../../core/services/public-news.service';
import { SeoService } from '../../../core/seo/seo.service';
import { SchemaService } from '../../../core/seo/schema.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements AfterViewInit {
  readonly newsService = inject(PublicNewsService);

  private readonly seo = inject(SeoService);
  private readonly schema = inject(SchemaService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly highlight = signal<Notice | null>(null);
  readonly notices = signal<Notice[]>([]);

  readonly loadingInitial = signal(true);
  readonly loadingMore = signal(false);

  readonly currentPage = signal(1);
  readonly lastPage = signal(1);

  readonly hasMore = computed(() => this.currentPage() < this.lastPage());

  private observer?: IntersectionObserver;
  private triggerElement?: ElementRef<HTMLElement>;

  @ViewChild('loadMoreTrigger')
  set loadMoreTrigger(element: ElementRef<HTMLElement> | undefined) {
    this.triggerElement = element;
    this.observeTrigger();
  }

  constructor() {
    this.loadHomeAndFirstPage();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];

        if (entry.isIntersecting && this.hasMore() && !this.loadingMore()) {
          this.loadMore();
        }
      },
      {
        rootMargin: '400px',
      }
    );

    this.observeTrigger();
  }

  loadMore(): void {
    if (!this.hasMore() || this.loadingMore()) {
      return;
    }

    const nextPage = this.currentPage() + 1;
    this.loadingMore.set(true);

    this.newsService
      .latestNotices(nextPage, 12)
      .pipe(
        finalize(() => this.loadingMore.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(response => {
        this.applyNotices(response, false);
      });
  }

  private loadHomeAndFirstPage(): void {
    this.loadingInitial.set(true);

    this.newsService
      .home(4)
      .pipe(
        tap(home => {
          this.highlight.set(home.highlight);

          this.seo.setTags({
            title: 'Últimas notícias',
            description: environment.portal.description,
            image: home.highlight
              ? this.newsService.imageUrl(home.highlight.path_image)
              : environment.portal.defaultImage,
            url: `${environment.portal.url}/`,
            type: 'website',
          });

          this.schema.setWebsiteSchema();
          this.schema.setOrganizationSchema();
          this.schema.setHomePageSchema();
        }),
        switchMap(() => this.newsService.latestNotices(1, 12)),
        finalize(() => this.loadingInitial.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(response => {
        this.applyNotices(response, true);

        const schemaNotices = this.notices()
          .slice(0, 10)
          .map(notice => ({
            notice,
            imageUrl: this.newsService.imageUrl(notice.path_image),
          }));

        this.schema.setNewsItemListSchema(schemaNotices);
      });
  }

  private applyNotices(
    response: PaginatedResponse<Notice>,
    replace: boolean
  ): void {
    this.currentPage.set(response.current_page);
    this.lastPage.set(response.last_page);

    const highlightId = this.highlight()?.id;
    const existingIds = new Set(this.notices().map(notice => notice.id));

    const newNotices = response.data.filter(notice => {
      if (notice.id === highlightId) {
        return false;
      }

      if (!replace && existingIds.has(notice.id)) {
        return false;
      }

      return true;
    });

    if (replace) {
      this.notices.set(newNotices);
    } else {
      this.notices.update(current => [...current, ...newNotices]);
    }
  }

  private observeTrigger(): void {
    if (!this.observer || !this.triggerElement) {
      return;
    }

    this.observer.disconnect();
    this.observer.observe(this.triggerElement.nativeElement);
  }
}