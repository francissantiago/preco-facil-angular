import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppState, ConfiguracaoBase, Material, Orcamento } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly STORAGE_KEY = 'preco_facil_data';

  private initialState: AppState = {
    configuracaoBase: {
      metaMensal: 0,
      custosFixos: 0,
      horasPorMes: 160,
      valorHoraCalculado: 0
    },
    materiais: [],
    orcamentos: []
  };

  private stateSubject = new BehaviorSubject<AppState>(this.initialState);
  public state$ = this.stateSubject.asObservable();

  constructor() {
    this.loadState();
  }

  private loadState() {
    const savedState = localStorage.getItem(this.STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        this.stateSubject.next({ ...this.initialState, ...parsedState });
      } catch (e) {
        console.error('Erro ao carregar estado:', e);
        this.stateSubject.next(this.initialState);
      }
    }
  }

  private saveState(newState: AppState) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
    this.stateSubject.next(newState);
  }

  // --- Actions ---

  updateConfiguracao(config: Partial<ConfiguracaoBase>) {
    const currentState = this.stateSubject.value;
    const newConfig = { ...currentState.configuracaoBase, ...config };
    
    // Recalcular valor hora se necessário
    if (newConfig.horasPorMes > 0) {
      const totalNecessario = (newConfig.metaMensal || 0) + (newConfig.custosFixos || 0);
      newConfig.valorHoraCalculado = totalNecessario / newConfig.horasPorMes;
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
