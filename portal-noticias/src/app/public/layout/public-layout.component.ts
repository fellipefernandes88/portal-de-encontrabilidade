import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { shareReplay, tap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { environment } from '../../../environments/environment';
import { PublicNewsService } from '../../core/services/public-news.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,

    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
  ],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
})
export class PublicLayoutComponent implements AfterViewInit {
  readonly portal = environment.portal;

  private readonly publicNewsService = inject(PublicNewsService);

  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(false);

  @ViewChild('desktopNav')
  private desktopNav?: ElementRef<HTMLElement>;

  readonly categories$ = this.publicNewsService.categories().pipe(
    tap(() => {
      setTimeout(() => this.updateNavScrollButtons(), 300);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  ngAfterViewInit(): void {
    setTimeout(() => this.updateNavScrollButtons(), 300);
  }

  scrollNav(direction: 'left' | 'right'): void {
    const nav = this.desktopNav?.nativeElement;

    if (!nav) {
      return;
    }

    const amount = Math.round(nav.clientWidth * 0.75);

    nav.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth',
    });

    setTimeout(() => this.updateNavScrollButtons(), 300);
  }

  updateNavScrollButtons(): void {
    const nav = this.desktopNav?.nativeElement;

    if (!nav) {
      return;
    }

    const maxScrollLeft = nav.scrollWidth - nav.clientWidth;

    this.canScrollLeft.set(nav.scrollLeft > 4);
    this.canScrollRight.set(nav.scrollLeft < maxScrollLeft - 4);
  }
  
}