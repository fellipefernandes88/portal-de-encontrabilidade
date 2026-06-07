import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./public/layout/public-layout.component')
        .then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./public/pages/home/home-page.component')
            .then(m => m.HomePageComponent),
      },
      {
        path: 'noticias',
        loadComponent: () =>
          import('./public/pages/category-list/category-list-page.component')
            .then(m => m.CategoriesListPageComponent),
      },
  //     {
  //       path: 'noticias/:slug',
  //       loadComponent: () =>
  //         import('./public/pages/category-page/category-page.component')
  //           .then(m => m.CategoryPageComponent),
  //     },
      {
        path: 'noticia/:slug',
        loadComponent: () =>
          import('./public/pages/notice-page/notice-page.component')
            .then(m => m.NoticePageComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];