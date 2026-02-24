import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonItemSliding, IonItemOptions, IonItemOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonListHeader } from '@ionic/angular/standalone';
import { DataService } from '../services/data.service';
import { Material } from '../models/interfaces';
import { addIcons } from 'ionicons';
import { trash, add } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonListHeader, IonCardContent, IonCardTitle, IonCardHeader, IonCard, CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonItemSliding, IonItemOptions, IonItemOption]
})
export class Tab2Page implements OnInit {
  materiais: Material[] = [];
  novoMaterial: { nome: string; custo: number | null } = { nome: '', custo: null };

  constructor(private dataService: DataService) {
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
    }
  }

  removerMaterial(id: string) {
    this.dataService.deleteMaterial(id);
  }
}
