import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonTextarea, IonAccordionGroup, IonAccordion, IonNote, IonCardSubtitle } from '@ionic/angular/standalone';
import { DataService } from '../services/data.service';
import { Material, Orcamento, ConfiguracaoBase } from '../models/interfaces';
import { addIcons } from 'ionicons';
import { logoWhatsapp, trash, calculator, shareSocial } from 'ionicons/icons';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonCardSubtitle, IonNote, CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonTextarea, IonAccordionGroup, IonAccordion]
})
export class Tab3Page implements OnInit {
  orcamentos: Orcamento[] = [];
  materiaisDisponiveis: Material[] = [];
  config: ConfiguracaoBase | null = null;

  novoOrcamento = {
    titulo: '',
    horasEstimadas: 0,
    materiaisSelecionados: [] as string[], // IDs
    margemLucroPercentual: 20,
    precoFinal: 0
  };

  custoMaoDeObra: number = 0;
  custoMateriais: number = 0;
  lucro: number = 0;

  constructor(private dataService: DataService) {
    addIcons({ logoWhatsapp, trash, calculator, shareSocial });
  }

  ngOnInit() {
    this.dataService.state$.subscribe(state => {
      this.orcamentos = state.orcamentos;
      this.materiaisDisponiveis = state.materiais;
      this.config = state.configuracaoBase;
    });
  }

  calcular() {
    if (!this.config) return;

    // 1. Custo Mão de Obra
    this.custoMaoDeObra = (this.novoOrcamento.horasEstimadas || 0) * (this.config.valorHoraCalculado || 0);

    // 2. Custo Materiais
    this.custoMateriais = 0;
    if (this.novoOrcamento.materiaisSelecionados && this.novoOrcamento.materiaisSelecionados.length > 0) {
      this.novoOrcamento.materiaisSelecionados.forEach(id => {
        const material = this.materiaisDisponiveis.find(m => m.id === id);
        if (material) {
          this.custoMateriais += material.custo;
        }
      });
    }

    // 3. Subtotal e Lucro (Markup)
    const subtotal = this.custoMaoDeObra + this.custoMateriais;
    this.lucro = subtotal * ((this.novoOrcamento.margemLucroPercentual || 0) / 100);

    // 4. Preço Final
    this.novoOrcamento.precoFinal = subtotal + this.lucro;
  }

  salvarOrcamento() {
    this.calcular(); // Garantir atualizado
    if (!this.novoOrcamento.titulo) return;

    this.dataService.addOrcamento({
      titulo: this.novoOrcamento.titulo,
      horasEstimadas: this.novoOrcamento.horasEstimadas,
      materiaisUsados: this.novoOrcamento.materiaisSelecionados,
      margemLucroPercentual: this.novoOrcamento.margemLucroPercentual,
      precoFinal: this.novoOrcamento.precoFinal
    });

    // Reset form
    this.novoOrcamento = {
      titulo: '',
      horasEstimadas: 0,
      materiaisSelecionados: [],
      margemLucroPercentual: 20,
      precoFinal: 0
    };
    this.custoMaoDeObra = 0;
    this.custoMateriais = 0;
    this.lucro = 0;
  }

  removerOrcamento(id: string) {
    this.dataService.deleteOrcamento(id);
  }

  compartilharWhatsApp(orcamento: Orcamento) {
    const totalFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.precoFinal);
    
    let texto = `*Orçamento: ${orcamento.titulo}*\n\n`;
    texto += `⏳ Horas Estimadas: ${orcamento.horasEstimadas}h\n`;
    
    if (orcamento.materiaisUsados.length > 0) {
      texto += `🛠 Materiais/Custos:\n`;
      orcamento.materiaisUsados.forEach(id => {
        const mat = this.materiaisDisponiveis.find(m => m.id === id);
        if (mat) texto += `- ${mat.nome}\n`;
      });
    }
    
    texto += `\n💰 *Valor Total: ${totalFormatado}*`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }
}
