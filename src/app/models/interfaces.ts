export interface ConfiguracaoBase {
  nome: string;
  metaMensal: number;
  custosFixos: number;
  horasPorMes: number;
  valorHoraCalculado: number;
}

export interface Material {
  id: string;
  nome: string;
  custo: number;
}

export interface Orcamento {
  id: string;
  titulo: string;
  horasEstimadas: number;
  materiaisUsados: string[]; // IDs dos materiais
  margemLucroPercentual: number;
  precoFinal: number;
  dataCriacao: string;
}

export interface AppState {
  configuracaoBase: ConfiguracaoBase;
  materiais: Material[];
  orcamentos: Orcamento[];
}
