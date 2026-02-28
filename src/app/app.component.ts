import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';
import { ThemeService } from './services/theme.service';
import { AdMobService } from './services/admob.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private themeService: ThemeService,
    private admobService: AdMobService,
    private platform: Platform,
    private translate: TranslateService
  ) {
    this.initializeApp();
    this.configureLanguage();
  }

  async initializeApp() {
    await this.platform.ready();
    // AdMobService initializes automatically in its constructor
  }

  configureLanguage() {
    this.translate.addLangs(['pt-BR', 'en', 'es']);
    this.translate.setDefaultLang('pt-BR');

    const browserLang = this.translate.getBrowserLang();
    if (browserLang) {
      if (browserLang.match(/pt/)) {
        this.translate.use('pt-BR');
      } else if (browserLang.match(/es/)) {
        this.translate.use('es');
      } else {
        this.translate.use('en');
      }
    } else {
      this.translate.use('pt-BR');
    }
  }
}
