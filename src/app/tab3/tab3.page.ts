import { Component, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonTextarea, IonAccordionGroup, IonAccordion, IonNote, IonCardSubtitle, IonButtons, IonPopover, IonListHeader } from '@ionic/angular/standalone';
import { DataService } from '../services/data.service';
import { ToastService } from '../services/toast.service';
import { Material, Orcamento, ConfiguracaoBase } from '../models/interfaces';
import { addIcons } from 'ionicons';
import { logoWhatsapp, trash, calculator, shareSocial, globe, timeOutline, trendingUpOutline } from 'ionicons/icons';
import { AdMobService } from '../services/admob.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

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
  imports: [IonCardSubtitle, IonNote, CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonAccordionGroup, IonAccordion, IonButtons, IonPopover, IonList, TranslateModule]
})
export class Tab3Page implements OnInit {
  @ViewChild('popover') popover: any;
  
  private dataService = inject(DataService);
  private admobService = inject(AdMobService);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);

  // Signals for state
  state = toSignal(this.dataService.state$, { initialValue: { configuracaoBase: { nome: '', metaMensal: null, custosFixos: null, horasPorMes: null, valorHoraCalculado: 0 }, materiais: [], orcamentos: [] } });
  
  orcamentos = computed(() => this.state()?.orcamentos || []);
  materiaisDisponiveis = computed(() => this.state()?.materiais || []);
  config = computed(() => this.state()?.configuracaoBase || null);

  // Local mutable signal for the new budget form
  novoOrcamento = signal<{
    titulo: string;
    horasEstimadas: number | null;
    materiaisSelecionados: string[]; // IDs
    margemLucroPercentual: number | null;
    precoFinal: number;
  }>({
    titulo: '',
    horasEstimadas: null,
    materiaisSelecionados: [],
    margemLucroPercentual: 20,
    precoFinal: 0
  });

  // Computed values for the calculation logic
  custoMaoDeObra = computed(() => {
    const config = this.config();
    const orcamento = this.novoOrcamento();
    if (!config || !config.valorHoraCalculado) return 0;
    return (orcamento.horasEstimadas || 0) * config.valorHoraCalculado;
  });

  custoMateriais = computed(() => {
    const orcamento = this.novoOrcamento();
    const materiais = this.materiaisDisponiveis();
    if (!orcamento.materiaisSelecionados || orcamento.materiaisSelecionados.length === 0) return 0;
    
    return orcamento.materiaisSelecionados.reduce((total, id) => {
      const mat = materiais.find(m => m.id === id);
      return total + (mat ? mat.custo : 0);
    }, 0);
  });

  lucro = computed(() => {
    const subtotal = this.custoMaoDeObra() + this.custoMateriais();
    const margem = this.novoOrcamento().margemLucroPercentual || 0;
    return subtotal * (margem / 100);
  });

  precoFinal = computed(() => {
    return this.custoMaoDeObra() + this.custoMateriais() + this.lucro();
  });

  constructor() {
    addIcons({ logoWhatsapp, trash, calculator, shareSocial, globe, timeOutline, trendingUpOutline });
  }

  ngOnInit() {
    // No subscription needed
  }

  updateNovoOrcamento(field: string, value: any) {
    this.novoOrcamento.update(s => ({ ...s, [field]: value }));
  }

  salvarOrcamento() {
    const orcamentoAtual = this.novoOrcamento();
    
    if (!orcamentoAtual.titulo) {
      this.translate.get('TAB3.TOAST_TITLE_WARNING').subscribe((res: string) => {
        this.toastService.presentToast(res, 'warning');
      });
      return;
    }

    // Use computed price for saving
    const finalPrice = this.precoFinal();

    this.dataService.addOrcamento({
      titulo: orcamentoAtual.titulo,
      horasEstimadas: orcamentoAtual.horasEstimadas || 0,
      materiaisUsados: orcamentoAtual.materiaisSelecionados,
      margemLucroPercentual: orcamentoAtual.margemLucroPercentual || 0,
      precoFinal: finalPrice
    });

    // Reset form
    this.novoOrcamento.set({
      titulo: '',
      horasEstimadas: null,
      materiaisSelecionados: [],
      margemLucroPercentual: 20,
      precoFinal: 0
    });
    
    this.translate.get('TAB3.TOAST_SAVED').subscribe((res: string) => {
      this.toastService.presentToast(res, 'success');
    });
  }

  removerOrcamento(id: string) {
    this.dataService.deleteOrcamento(id);
    this.translate.get('TAB3.TOAST_REMOVED').subscribe((res: string) => {
      this.toastService.presentToast(res, 'primary');
    });
  }

  changeLanguage(event: any) {
    if (event.detail && event.detail.value) {
      this.translate.use(event.detail.value);
    }
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

  async compartilharWhatsApp(orcamento: Orcamento) {
    const totalFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.precoFinal);
    
    // Obter traduções assincronamente
    const translations = await firstValueFrom(this.translate.get('WHATSAPP'));

    let texto = `*${translations.BUDGET_TITLE}: ${orcamento.titulo}*\n\n`;
    texto += `${translations.ESTIMATED_HOURS}: ${orcamento.horasEstimadas}h\n`;
    
    if (orcamento.materiaisUsados.length > 0) {
      texto += `${translations.MATERIALS_COSTS}:\n`;
      orcamento.materiaisUsados.forEach(id => {
        const mat = this.materiaisDisponiveis().find(m => m.id === id); // Use signal
        if (mat) texto += `- ${mat.nome}\n`;
      });
    }
    
    texto += `\n*${translations.TOTAL_VALUE}: ${totalFormatado}*`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }

  async gerarPDF(orcamento: Orcamento) {
    const totalFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.precoFinal);
    
    // Obter traduções
    const t = await firstValueFrom(this.translate.get('PDF'));

    // 1. Preparar a lista de materiais para a tabela do PDF
    const linhasMateriais = [];
    if (orcamento.materiaisUsados && orcamento.materiaisUsados.length > 0) {
      linhasMateriais.push([{ text: t.MATERIALS_HEADER, bold: true }, { text: t.VALUE_HEADER, bold: true }]);
      
      orcamento.materiaisUsados.forEach(id => {
        const mat = this.materiaisDisponiveis().find(m => m.id === id); // Use signal
        if (mat) {
          linhasMateriais.push([
            mat.nome, 
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mat.custo)
          ]);
        }
      });
    } else {
      linhasMateriais.push([t.NO_EXTRA_COSTS, '-']);
    }

    // 2. Desenhar a estrutura do documento
    const nomeEmpresa = this.config()?.nome || t.DEFAULT_TITLE; // Use signal
    
    const docDefinition: any = {
      content: [
        { text: nomeEmpresa, style: 'header', alignment: 'center' },
        { text: t.PROPOSAL_SUBTITLE, style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },
        
        { text: `${t.PROJECT_LABEL}: ${orcamento.titulo}`, style: 'h3' },
        { text: `${t.DATE_LABEL}: ${new Date().toLocaleDateString('pt-BR')}`, margin: [0, 0, 0, 20] },
        
        { text: t.LABOR_SECTION, style: 'sectionHeader' },
        { text: `${orcamento.horasEstimadas}h ${t.LABOR_DESC}`, margin: [0, 0, 0, 15] },

        { text: t.MATERIALS_SECTION, style: 'sectionHeader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: linhasMateriais
          },
          margin: [0, 0, 0, 20]
        },

        { text: `${t.TOTAL_SUGGESTED}: ${totalFormatado}`, style: 'total', alignment: 'right' }
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
      this.translate.get('TAB3.TOAST_PDF_ERROR').subscribe((res: string) => {
        this.toastService.presentToast(res, 'danger');
      });
    }
  }
}
