import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonItemSliding, IonItemOptions, IonItemOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonListHeader } from '@ionic/angular/standalone';
import { DataService } from '../services/data.service';
import { ToastService } from '../services/toast.service';
import { Material } from '../models/interfaces';
import { addIcons } from 'ionicons';
import { trash, add } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonListHeader, IonCardContent, IonCardTitle, IonCardHeader, IonCard, CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonItemSliding, IonItemOptions, IonItemOption, TranslateModule]
})
export class Tab2Page implements OnInit {
  materiais: Material[] = [];
  novoMaterial: { nome: string; custo: number | null } = { nome: '', custo: null };

  constructor(
    private dataService: DataService,
    private toastService: ToastService,
    private translate: TranslateService
  ) {
    addIcons({ trash, add });
  }

  ngOnInit() {
    this.dataService.state$.subscribe(state => {
      this.materiais = state.materiais;
    });
  }

  adicionarMaterial() {
    if (this.novoMaterial.nome && this.novoMaterial.custo !== null) {
      this.dataService.addMaterial({
        nome: this.novoMaterial.nome,
        custo: Number(this.novoMaterial.custo)
      });
      this.novoMaterial = { nome: '', custo: null };
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
}
