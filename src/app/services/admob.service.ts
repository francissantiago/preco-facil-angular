import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, AdMobError, BannerAdPluginEvents, RewardAdOptions, RewardAdPluginEvents } from '@capacitor-community/admob';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdMobService {
  private bannerVisibleSubject = new BehaviorSubject<boolean>(false);
  public bannerVisible$ = this.bannerVisibleSubject.asObservable();

  constructor(private platform: Platform) {
    this.platform.ready().then(() => {
      this.initializeAdMob();
    });
  }

  async initializeAdMob() {
    try {
      await AdMob.initialize({
        testingDevices: [],
        initializeForTesting: false
      });
      
      this.setupListeners();
      this.showBanner();
    } catch (e) {
      console.error('Falha ao inicializar AdMob', e);
    }
  }

  setupListeners() {
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      console.log('Banner carregado com sucesso');
      this.bannerVisibleSubject.next(true);
    });

    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
      console.error('Falha ao carregar banner', error);
      this.bannerVisibleSubject.next(false);
    });
  }

  async showBanner() {
    const options: BannerAdOptions = {
      adId: 'ca-app-pub-7605283942830580/2940764462', // ID oficial do Google para Banner Android
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: true
    };

    try {
      await AdMob.showBanner(options);
    } catch (e) {
      console.error('Falha ao exibir banner', e);
      this.bannerVisibleSubject.next(false);
    }
  }

  async hideBanner() {
    try {
      await AdMob.hideBanner();
      this.bannerVisibleSubject.next(false);
    } catch (e) {
      console.error('Falha ao esconder banner', e);
    }
  }

  async resumeBanner() {
    try {
      await AdMob.resumeBanner();
      this.bannerVisibleSubject.next(true);
    } catch (e) {
      console.error('Falha ao resumir banner', e);
    }
  }

  async showRewardedAd(onRewardCallback: () => void) {
    const options: RewardAdOptions = {
      adId: 'ca-app-pub-7605283942830580/2222579166', // ID Oficial de Teste para Vídeo Premiado
      isTesting: true
    };

    try {
      // 1. Prepara o anúncio em segundo plano
      await AdMob.prepareRewardVideoAd(options);

      // 2. Cria o ouvinte para quando o usuário ganhar a recompensa
      const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (rewardItem: any) => {
        console.log('Vídeo assistido! Liberando ação...', rewardItem);
        onRewardCallback();
        (rewardListener).remove(); // Limpa o ouvinte após o uso
      });

      // 3. Cria um ouvinte para caso o usuário feche antes de terminar (opcional, aqui não estamos punindo ele)
      const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, async () => {
        await (dismissListener).remove();
      });

      // 4. Exibe o vídeo
      await AdMob.showRewardVideoAd();

    } catch (e) {
      console.error('Falha ao exibir vídeo premiado. Liberando ação por fallback.', e);
      // Fallback de Usabilidade: Se der erro (ex: sem internet), libera a ação para o usuário não ficar travado.
      onRewardCallback();
    }
  }
}
