import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server,
  },
  {
    path: 'noticias',
    renderMode: RenderMode.Server,
  },
  {
    path: 'noticias/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'noticia/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'noticias',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];