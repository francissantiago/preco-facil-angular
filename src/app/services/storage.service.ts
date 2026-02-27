import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { ConfiguracaoBase, Material, Orcamento } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // Chaves de armazenamento
  private readonly KEYS = {
    CONFIG_BASE: 'configuracao_base',
    MATERIAIS: 'materiais_lista',
    ORCAMENTOS: 'orcamentos_salvos'
  };

  constructor() { }

  // ==========================================
  // CONFIGURAÇÃO BASE (Aba 1: Meu Valor)
  // ==========================================
  async salvarConfiguracaoBase(config: ConfiguracaoBase): Promise<void> {
    await Preferences.set({
      key: this.KEYS.CONFIG_BASE,
      value: JSON.stringify(config)
    });
  }

  async obterConfiguracaoBase(): Promise<ConfiguracaoBase | null> {
    const { value } = await Preferences.get({ key: this.KEYS.CONFIG_BASE });
    return value ? JSON.parse(value) : null;
  }

  // ==========================================
  // MATERIAIS / CUSTOS EXTRAS (Aba 2)
  // ==========================================
  async salvarMateriais(materiais: Material[]): Promise<void> {
    await Preferences.set({
      key: this.KEYS.MATERIAIS,
      value: JSON.stringify(materiais)
    });
  }

  async obterMateriais(): Promise<Material[]> {
    const { value } = await Preferences.get({ key: this.KEYS.MATERIAIS });
    return value ? JSON.parse(value) : [];
  }

  // ==========================================
  // ORÇAMENTOS (Aba 3)
  // ==========================================
  async salvarOrcamentos(orcamentos: Orcamento[]): Promise<void> {
    await Preferences.set({
      key: this.KEYS.ORCAMENTOS,
      value: JSON.stringify(orcamentos)
    });
  }

  async obterOrcamentos(): Promise<Orcamento[]> {
    const { value } = await Preferences.get({ key: this.KEYS.ORCAMENTOS });
    return value ? JSON.parse(value) : [];
  }
}
