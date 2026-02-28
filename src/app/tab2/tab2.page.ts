import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/angular/standalone';
import { DataService } from '../services/data.service';
import { ToastService } from '../services/toast.service';
import { addIcons } from 'ionicons';
import { trash, add } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { AppHeaderComponent } from '../components/app-header/app-header.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonItemSliding, IonItemOptions, IonItemOption, TranslateModule, AppHeaderComponent]
})
export class Tab2Page implements OnInit {
  
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);

  // Signals
  state = toSignal(this.dataService.state$, { initialValue: { configuracaoBase: { nome: '', metaMensal: null, custosFixos: null, horasPorMes: null, valorHoraCalculado: 0 }, materiais: [], orcamentos: [] } });
  
  materiais = computed(() => this.state()?.materiais || []);
  
  novoMaterial = signal<{ nome: string; custo: number | null }>({ nome: '', custo: null });

  constructor() {
    addIcons({ trash, add });
  }

  ngOnInit() {
    // No subscription needed
  }

  adicionarMaterial() {
    const material = this.novoMaterial();
    if (material.nome && material.custo !== null) {
      this.dataService.addMaterial({
        nome: material.nome,
        custo: Number(material.custo)
      });
      this.novoMaterial.set({ nome: '', custo: null });
      this.translate.get('TAB2.TOAST_ADDED').subscribe((res: string) => {
        this.toastService.presentToast(res, 'success');
      });
    } else {
      this.translate.get('TAB2.TOAST_WARNING').subscribe((res: string) => {
        this.toastService.presentToast(res, 'warning');
      });
    }
  }

  removerMaterial(id: string) {
    this.dataService.deleteMaterial(id);
    this.translate.get('TAB2.TOAST_REMOVED').subscribe((res: string) => {
      this.toastService.presentToast(res, 'primary');
    });
  }

  updateNovoMaterial(field: string, value: any) {
    this.novoMaterial.update(m => ({ ...m, [field]: value }));
  }

  changeLanguage(event: any) {
    if (event.detail && event.detail.value) {
      this.translate.use(event.detail.value);
    }
  }
}
