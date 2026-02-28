import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'preco_facil_theme';
  private themeSubject = new BehaviorSubject<Theme>('system');
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.loadTheme();
    this.listenToSystemChanges();
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme) {
      this.themeSubject.next(savedTheme);
      this.applyTheme(savedTheme);
    } else {
      this.themeSubject.next('system');
      this.applyTheme('system');
    }
  }

  private listenToSystemChanges() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.themeSubject.value === 'system') {
        this.applyTheme('system');
      }
    });
  }

  setTheme(theme: Theme) {
    this.themeSubject.next(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme) {
    const html = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      html.classList.add('ion-palette-dark');
      html.classList.add('dark');
    } else {
      html.classList.remove('ion-palette-dark');
      html.classList.remove('dark');
    }
  }

  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }
}
