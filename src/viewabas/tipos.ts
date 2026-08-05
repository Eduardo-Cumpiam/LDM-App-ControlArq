// tipos.ts
// Tipos de dados utilizados em várias abas do projeto
// ====================================================================================
 
export interface DetalheMes {
  mesAno: string;
  totalHoras: number;
  custoHoras: number;
  despesas: number;
  impostos: number;
  gastosExtras: number;
  projetos?: { [nomeProjeto: string]: { horas: number; custo: number } };
}

export interface ItemProjetoBI {
  id: string;
  nome: string;
  cor: string;
  valor_orcamento: number;
  totalHorasGeral: number;
  custoHorasGeral: number;
  despesasGeral: number;
  impostosGeral: number;
  gastosExtrasGeral: number;
  meses: { [key: string]: DetalheMes };
}

export interface ItemColaboradorBI {
  id: string;
  nome: string;
  totalHorasGeral: number;
  custoGeral: number;
  meses: { [key: string]: DetalheMes };
}
