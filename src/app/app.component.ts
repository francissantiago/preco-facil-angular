import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';
import { ThemeService } from './services/theme.service';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, AdMobError } from '@capacitor-community/admob';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private themeService: ThemeService,
    private platform: Platform
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    
    try {
      await AdMob.initialize({
        testingDevices: ['YOUR_DEVICE_ID'],
        initializeForTesting: true
      });
      
      this.showBanner();
    } catch (e) {
      console.error('Falha ao inicializar AdMob', e);
    }
  }

  async showBanner() {
    const options: BannerAdOptions = {
      adId: 'ca-app-pub-3940256099942544/6300978111', // ID de Teste do Google para Banner Android
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: true
    };

    try {
      await AdMob.showBanner(options);
    } catch (e) {
      console.error('Falha ao exibir banner', e);
    }
  }
}
