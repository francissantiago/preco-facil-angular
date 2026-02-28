import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonPopover, IonContent, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { globe } from 'ionicons/icons';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonPopover,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    TranslateModule
  ]
})
export class AppHeaderComponent {
  @Input() title: string = '';

  private translate = inject(TranslateService);

  constructor() {
    addIcons({ globe });
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }
}
