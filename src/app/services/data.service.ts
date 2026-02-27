import { Injectable } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { AppState, ConfiguracaoBase, Material, Orcamento } from '../models/interfaces';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private initialState: AppState = {
    configuracaoBase: {
      nome: '',
      metaMensal: null,
      custosFixos: null,
      horasPorMes: null,
      valorHoraCalculado: 0
    },
    materiais: [],
    orcamentos: []
  };

  private stateSubject = new BehaviorSubject<AppState>(this.initialState);
  public state$ = this.stateSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadState();
  }

  private async loadState() {
    try {
      const [config, materiais, orcamentos] = await Promise.all([
        this.storageService.obterConfiguracaoBase(),
        this.storageService.obterMateriais(),
        this.storageService.obterOrcamentos()
      ]);

      const loadedState: AppState = {
        configuracaoBase: config || this.initialState.configuracaoBase,
        materiais: materiais || [],
        orcamentos: orcamentos || []
      };

      this.stateSubject.next(loadedState);
    } catch (e) {
      console.error('Erro ao carregar estado do Storage:', e);
      this.stateSubject.next(this.initialState);
    }
  }

  private saveState(newState: AppState) {
    // Atualiza o estado em memória imediatamente para a UI reagir
    this.stateSubject.next(newState);

    // Persiste no Storage de forma assíncrona
    this.storageService.salvarConfiguracaoBase(newState.configuracaoBase);
    this.storageService.salvarMateriais(newState.materiais);
    this.storageService.salvarOrcamentos(newState.orcamentos);
  }

  // --- Actions ---

  updateConfiguracao(config: Partial<ConfiguracaoBase>) {
    const currentState = this.stateSubject.value;
    const newConfig = { ...currentState.configuracaoBase, ...config };
    
    // Recalcular valor hora se necessário
    if (newConfig.horasPorMes !== null && newConfig.horasPorMes > 0) {
      const totalNecessario = (Number(newConfig.metaMensal) || 0) + (Number(newConfig.custosFixos) || 0);
      newConfig.valorHoraCalculado = totalNecessario / Number(newConfig.horasPorMes);
    } else {
      newConfig.valorHoraCalculado = 0;
    }

    this.saveState({
      ...currentState,
      configuracaoBase: newConfig
    });
  }

  addMaterial(material: Omit<Material, 'id'>) {
    const currentState = this.stateSubject.value;
    const newMaterial: Material = {
      ...material,
      id: Date.now().toString() // Simple ID generation
    };
    this.saveState({
      ...currentState,
      materiais: [...currentState.materiais, newMaterial]
    });
  }

  updateMaterial(material: Material) {
    const currentState = this.stateSubject.value;
    const updatedMateriais = currentState.materiais.map(m => 
      m.id === material.id ? material : m
    );
    this.saveState({
      ...currentState,
      materiais: updatedMateriais
    });
  }

  deleteMaterial(id: string) {
    const currentState = this.stateSubject.value;
    const updatedMateriais = currentState.materiais.filter(m => m.id !== id);
    this.saveState({
      ...currentState,
      materiais: updatedMateriais
    });
  }

  addOrcamento(orcamento: Omit<Orcamento, 'id' | 'dataCriacao'>) {
    const currentState = this.stateSubject.value;
    const newOrcamento: Orcamento = {
      ...orcamento,
      id: Date.now().toString(),
      dataCriacao: new Date().toISOString()
    };
    this.saveState({
      ...currentState,
      orcamentos: [newOrcamento, ...currentState.orcamentos] // Newest first
    });
  }

  deleteOrcamento(id: string) {
    const currentState = this.stateSubject.value;
    const updatedOrcamentos = currentState.orcamentos.filter(o => o.id !== id);
    this.saveState({
      ...currentState,
      orcamentos: updatedOrcamentos
    });
  }
  
  getMaterialById(id: string): Material | undefined {
      return this.stateSubject.value.materiais.find(m => m.id === id);
  }
}
