import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonTextarea, IonAccordionGroup, IonAccordion, IonNote, IonCardSubtitle } from '@ionic/angular/standalone';
import { DataService } from '../services/data.service';
import { Material, Orcamento, ConfiguracaoBase } from '../models/interfaces';
import { addIcons } from 'ionicons';
import { logoWhatsapp, trash, calculator, shareSocial } from 'ionicons/icons';
import { AdMobService } from '../services/admob.service';

// Imports para gerar e partilhar o PDF
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// Injeção das fontes no pdfMake para suportar acentuação e caracteres latinos
// (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonCardSubtitle, IonNote, CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonAccordionGroup, IonAccordion]
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

  constructor(
    private dataService: DataService,
    private admobService: AdMobService
  ) {
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

  acaoComAnuncio(tipo: 'whatsapp' | 'pdf', orcamento: Orcamento) {
    // Chama o serviço de anúncio passando a função que deve ser executada após o vídeo
    this.admobService.showRewardedAd(() => {
      if (tipo === 'whatsapp') {
        this.compartilharWhatsApp(orcamento);
      } else if (tipo === 'pdf') {
        this.gerarPDF(orcamento);
      }
    });
  }

  compartilharWhatsApp(orcamento: Orcamento) {
    const totalFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.precoFinal);
    
    let texto = `*Orçamento: ${orcamento.titulo}*\n\n`;
    texto += `Horas Estimadas: ${orcamento.horasEstimadas}h\n`;
    
    if (orcamento.materiaisUsados.length > 0) {
      texto += `Materiais/Custos:\n`;
      orcamento.materiaisUsados.forEach(id => {
        const mat = this.materiaisDisponiveis.find(m => m.id === id);
        if (mat) texto += `- ${mat.nome}\n`;
      });
    }
    
    texto += `\n*Valor Total: ${totalFormatado}*`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }

  async gerarPDF(orcamento: Orcamento) {
    const totalFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.precoFinal);
    
    // 1. Preparar a lista de materiais para a tabela do PDF
    const linhasMateriais = [];
    if (orcamento.materiaisUsados && orcamento.materiaisUsados.length > 0) {
      linhasMateriais.push([{ text: 'Material / Custo Extra', bold: true }, { text: 'Valor', bold: true }]);
      
      orcamento.materiaisUsados.forEach(id => {
        const mat = this.materiaisDisponiveis.find(m => m.id === id);
        if (mat) {
          linhasMateriais.push([
            mat.nome, 
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mat.custo)
          ]);
        }
      });
    } else {
      linhasMateriais.push(['Sem custos extras registados', '-']);
    }

    // 2. Desenhar a estrutura do documento
    const nomeEmpresa = this.config?.nome || 'Orçamento';
    
    const docDefinition: any = {
      content: [
        { text: nomeEmpresa, style: 'header', alignment: 'center' },
        { text: 'Proposta de Orçamento', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },
        
        { text: `Projeto: ${orcamento.titulo}`, style: 'h3' },
        { text: `Data: ${new Date().toLocaleDateString('pt-BR')}`, margin: [0, 0, 0, 20] },
        
        { text: 'Mão de Obra (Horas Estimadas)', style: 'sectionHeader' },
        { text: `${orcamento.horasEstimadas}h de trabalho dedicado ao projeto.`, margin: [0, 0, 0, 15] },

        { text: 'Custos Adicionais e Materiais', style: 'sectionHeader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: linhasMateriais
          },
          margin: [0, 0, 0, 20]
        },

        { text: `Valor Total Sugerido: ${totalFormatado}`, style: 'total', alignment: 'right' }
      ],
      styles: {
        header: { fontSize: 22, bold: true, color: '#3880ff' },
        subheader: { fontSize: 16, color: '#666666' },
        h3: { fontSize: 14, bold: true },
        sectionHeader: { fontSize: 12, bold: true, color: '#3880ff', margin: [0, 10, 0, 5] },
        total: { fontSize: 16, bold: true, marginTop: 20 }
      }
    };

    try {
      // 1. Captura as fontes contornando a checagem estrita do TypeScript
      const fontesVFS = (pdfFonts as any)['pdfMake'] ? (pdfFonts as any)['pdfMake'].vfs : (pdfFonts as any).vfs;

      // 2. Passa o VFS diretamente como o quarto parâmetro (docDefinition, tableLayouts, fonts, vfs)
      const pdfDocGenerator = pdfMake.createPdf(docDefinition, fontesVFS);
      
      // 3. getBase64() agora é uma Promise (não recebe mais callback)
      const base64Data = await pdfDocGenerator.getBase64();

      const nomeFicheiro = `orcamento-${orcamento.titulo.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;

      // 4. Guardar o ficheiro na cache do telemóvel
      const savedFile = await Filesystem.writeFile({
        path: nomeFicheiro,
        data: base64Data,
        directory: Directory.Cache
      });

      // 5. Partilhar ou abrir o PDF com as aplicações nativas do Android
      await Share.share({
        title: `Orçamento - ${orcamento.titulo}`,
        text: 'Segue em anexo a proposta de orçamento.',
        url: savedFile.uri,
        dialogTitle: 'Partilhar Orçamento'
      });
      
    } catch (error) {
      console.error('Erro ao gerar ou partilhar o PDF', error);
      alert('Ocorreu um erro ao tentar gerar o PDF. Verifique as permissões da aplicação.');
    }
  }
}
