import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonNote, IonButton, IonSegment, IonSegmentButton, IonIcon } from '@ionic/angular/standalone';
import { DataService } from '../services/data.service';
import { ThemeService, Theme } from '../services/theme.service';
import { ConfiguracaoBase } from '../models/interfaces';
import { addIcons } from 'ionicons';
import { moon, sunny, settings, phonePortrait, documentText, shieldCheckmark } from 'ionicons/icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonNote, IonButton, IonSegment, IonSegmentButton, IonIcon, RouterLink],
})
export class Tab1Page implements OnInit {
  config: ConfiguracaoBase = {
    metaMensal: 0,
    custosFixos: 0,
    horasPorMes: 160,
    valorHoraCalculado: 0
  };
  currentTheme: Theme = 'system';

  constructor(
    private dataService: DataService,
    private themeService: ThemeService
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
  }

  calculateHora() {
    if (this.config.horasPorMes > 0) {
      const totalNecessario = (Number(this.config.metaMensal) || 0) + (Number(this.config.custosFixos) || 0);
      this.config.valorHoraCalculado = totalNecessario / Number(this.config.horasPorMes);
    } else {
      this.config.valorHoraCalculado = 0;
    }
  }

  changeTheme(event: any) {
    this.themeService.setTheme(event.detail.value);
  }
}
