import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, filter, switchMap, map } from 'rxjs';

import { PublicNewsService } from '../../../core/services/public-news.service';
import { Notice } from '../../../core/models/notice.model';

@Component({
  selector: 'app-search-bar',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {
  private readonly newsService = inject(PublicNewsService);
  private readonly router = inject(Router);

  // Campo reativo: cada tecla digitada emite um valor
  searchControl = new FormControl('');

  // Fluxo do autocomplete:
  // digitou -> espera 300ms parado -> ignora repetido -> minimo 2 letras -> chama a API
  suggestions$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter((term): term is string => !!term && term.trim().length >= 2),
    switchMap(term => this.newsService.search(term.trim(), 5)),
    map(response => response.data)
  );

  // Ao escolher uma sugestao, navega direto para a noticia
  goToNotice(notice: Notice): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.router.navigate(['/noticia', notice.slug]);
  }
}