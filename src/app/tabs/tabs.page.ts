import { Component, EnvironmentInjector, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, construct, calculator } from 'ionicons/icons';
import { AdMobService } from '../services/admob.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, CommonModule, TranslateModule],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  public bannerVisible$ = this.admobService.bannerVisible$;

  constructor(private admobService: AdMobService) {
    addIcons({ person, construct, calculator });
  }
}
