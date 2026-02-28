import { Component, OnInit, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonNote, IonButton, IonSegment, IonSegmentButton, IonIcon, IonButtons, IonPopover, IonList } from '@ionic/angular/standalone';
import { DataService } from '../services/data.service';
import { ThemeService, Theme } from '../services/theme.service';
import { ToastService } from '../services/toast.service';
import { ConfiguracaoBase } from '../models/interfaces';
import { addIcons } from 'ionicons';
import { moon, sunny, settings, phonePortrait, documentText, shieldCheckmark, globe } from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonNote, IonButton, IonSegment, IonSegmentButton, IonIcon, IonButtons, IonPopover, IonList, RouterLink, TranslateModule],
})
export class Tab1Page implements OnInit {
  @ViewChild('popover') popover: any;
  
  private dataService = inject(DataService);
  private themeService = inject(ThemeService);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);

  // Signals
  state = toSignal(this.dataService.state$, { initialValue: { configuracaoBase: { nome: '', metaMensal: null, custosFixos: null, horasPorMes: null, valorHoraCalculado: 0 }, materiais: [], orcamentos: [] } });
  currentTheme = toSignal(this.themeService.theme$, { initialValue: 'system' as Theme });

  // Local state as a mutable signal for form binding
  config = signal<ConfiguracaoBase>({
    nome: '',
    metaMensal: null,
    custosFixos: null,
    horasPorMes: null,
    valorHoraCalculado: 0
  });

  constructor() {
    addIcons({ moon, sunny, settings, phonePortrait, documentText, shieldCheckmark, globe });
    
    // Sync local state with store when store updates
    effect(() => {
      const state = this.state();
      if (state && state.configuracaoBase) {
        // Only update if not dirty? For now, simple sync.
        this.config.set({ ...state.configuracaoBase });
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // Subscription handled by toSignal and effect
  }

  saveConfig() {
    this.dataService.updateConfiguracao(this.config());
    this.translate.get('TAB1.TOAST_SUCCESS').subscribe((res: string) => {
      this.toastService.presentToast(res, 'success');
    });
  }

  calculateHora() {
    const currentConfig = this.config();
    const horas = Number(currentConfig.horasPorMes);
    let novoValorHora = 0;

    if (horas > 0) {
      const totalNecessario = (Number(currentConfig.metaMensal) || 0) + (Number(currentConfig.custosFixos) || 0);
      novoValorHora = totalNecessario / horas;
    }

    this.config.update(c => ({ ...c, valorHoraCalculado: novoValorHora }));
  }

  updateConfig(field: keyof ConfiguracaoBase, value: any) {
    this.config.update(c => ({ ...c, [field]: value }));
    // Recalculate hourly rate if relevant fields change
    if (['metaMensal', 'custosFixos', 'horasPorMes'].includes(field)) {
      this.calculateHora();
    }
  }

  changeLanguage(event: any) {
    if (event.detail && event.detail.value) {
      this.translate.use(event.detail.value);
    }
  }

  setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }
}
