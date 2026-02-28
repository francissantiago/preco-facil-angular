import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonNote, IonButton, IonSegment, IonSegmentButton, IonIcon } from '@ionic/angular/standalone';
import { DataService } from '../services/data.service';
import { ThemeService, Theme } from '../services/theme.service';
import { ToastService } from '../services/toast.service';
import { ConfiguracaoBase } from '../models/interfaces';
import { addIcons } from 'ionicons';
import { moon, sunny, settings, phonePortrait, documentText, shieldCheckmark } from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonNote, IonButton, IonSegment, IonSegmentButton, IonIcon, RouterLink, TranslateModule],
})
export class Tab1Page implements OnInit {
  config: ConfiguracaoBase = {
    nome: '',
    metaMensal: null,
    custosFixos: null,
    horasPorMes: null,
    valorHoraCalculado: 0
  };
  currentTheme: Theme = 'system';

  constructor(
    private dataService: DataService,
    private themeService: ThemeService,
    private toastService: ToastService,
    private translate: TranslateService
  ) {
    addIcons({ moon, sunny, settings, phonePortrait, documentText, shieldCheckmark });
  }

  ngOnInit() {
    this.dataService.state$.subscribe(state => {
      this.config = { ...state.configuracaoBase };
    });
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  saveConfig() {
    this.dataService.updateConfiguracao(this.config);
    this.translate.get('TAB1.TOAST_SUCCESS').subscribe((res: string) => {
      this.toastService.presentToast(res, 'success');
    });
  }

  calculateHora() {
    const horas = Number(this.config.horasPorMes);
    if (horas > 0) {
      const totalNecessario = (Number(this.config.metaMensal) || 0) + (Number(this.config.custosFixos) || 0);
      this.config.valorHoraCalculado = totalNecessario / horas;
    } else {
      this.config.valorHoraCalculado = 0;
    }
  }

  changeTheme(event: any) {
    this.themeService.setTheme(event.detail.value);
  }
}
