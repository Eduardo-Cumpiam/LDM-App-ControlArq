// TelaPainelAnalitico.tsx
// Arquivo Módulo BI Expandido com Finanças (Painel Analítico)
// Módulo de BI & Gestão Avançada (DRE Financeiro + Folha de Horas por Colaborador)
// ====================================================================================

import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

// Firebase
import { db } from "../services/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

// Expo Impressão e Compartilhamento Nativos
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Componentes locais e Contextos
import AppHeader from "../components/AppHeader";
import AppCopyrigth from "../components/AppCopyrigth";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/AppNavigator";

type TelaPainelNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaPainelAnalitico">;
type Props = { navigation: TelaPainelNavigationProp };

interface DetalheMes {
  mesAno: string; 
  totalHoras: number;
  custoHoras: number;
  despesas: number;
  impostos: number;
  gastosExtras: number; 
  projetos?: { [nomeProjeto: string]: { horas: number; custo: number } }; 
}

interface ItemProjetoBI {
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

interface ItemColaboradorBI {
  id: string;
  nome: string;
  totalHorasGeral: number;
  custoGeral: number;
  meses: { [key: string]: DetalheMes };
}

export default function TelaPainelAnalitico({ navigation }: Props) {
  const { perfil, logout } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<"projetos" | "colaboradores">("projetos");
  const [expandidos, setExpandidos] = useState<{ [key: string]: boolean }>({});

  const [dadosProjetos, setDadosProjetos] = useState<ItemProjetoBI[]>([]);
  const [dadosColaboradores, setDadosColaboradores] = useState<ItemColaboradorBI[]>([]);

  const toggleExpandir = (id: string) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useFocusEffect(
    useCallback(() => {
      const processarMetricasBI = async () => {
        try {
          setCarregando(true);

          // 1. BUSCAR PROJETOS ATIVOS
          const qProjetos = query(collection(db, "projetos"), where("status", "==", "ativo"));
          const snapProjetos = await getDocs(qProjetos);
          
          const mapeamentoProjetos: { [id: string]: ItemProjetoBI } = {};
          const listaIdsProjetosAtivos: string[] = [];

          snapProjetos.forEach((docSnap) => {
            const p = docSnap.data();
            listaIdsProjetosAtivos.push(docSnap.id);
            mapeamentoProjetos[docSnap.id] = {
              id: docSnap.id,
              nome: p.nome_projeto || "Sem nome",
              cor: p.cor_projeto || "#00aeff",
              valor_orcamento: Number(p.valor_orcamento) || 0,
              totalHorasGeral: 0,
              custoHorasGeral: 0,
              despesasGeral: 0,
              impostosGeral: 0,
              gastosExtrasGeral: 0,
              meses: {}
            };
          });

          if (listaIdsProjetosAtivos.length === 0) {
            setDadosProjetos([]);
            setDadosColaboradores([]);
            setCarregando(false);
            return;
          }

          // 2. BUSCAR APONTAMENTOS DE HORAS
          const snapHoras = await getDocs(collection(db, "registro_horas"));
          const mapeamentoColaboradores: { [id: string]: ItemColaboradorBI } = {};

          snapHoras.forEach((docSnap) => {
            const reg = docSnap.data();
            const idProjeto = reg.fk_projeto;

            if (!listaIdsProjetosAtivos.includes(idProjeto)) return;

            const horas = Number(reg.duracao_total) || 0;
            const valorHora = Number(reg.valor_hora_tecnica) || 0;
            const custo = horas * valorHora;
            
            const idColaborador = reg.fk_usuario;
            const nomeColaborador = reg.usuario_nome || "Colaborador";
            const nomeProjeto = mapeamentoProjetos[idProjeto].nome;

            let mesAno = "Indefinido";
            if (reg.data_lancamento) {
              const data = reg.data_lancamento.toDate();
              mesAno = `${String(data.getMonth() + 1).padStart(2, "0")}/${data.getFullYear()}`;
            }

            // Agregação Projeto
            const proj = mapeamentoProjetos[idProjeto];
            proj.totalHorasGeral += horas;
            proj.custoHorasGeral += custo;

            if (!proj.meses[mesAno]) {
              proj.meses[mesAno] = { mesAno, totalHoras: 0, custoHoras: 0, despesas: 0, impostos: 0, gastosExtras: 0 };
            }
            proj.meses[mesAno].totalHoras += horas;
            proj.meses[mesAno].custoHoras += custo;

            // Agregação Colaborador
            if (!mapeamentoColaboradores[idColaborador]) {
              mapeamentoColaboradores[idColaborador] = { id: idColaborador, nome: nomeColaborador, totalHorasGeral: 0, custoGeral: 0, meses: {} };
            }
            const colab = mapeamentoColaboradores[idColaborador];
            colab.totalHorasGeral += horas;
            colab.custoGeral += custo;

            if (!colab.meses[mesAno]) {
              colab.meses[mesAno] = { mesAno, totalHoras: 0, custoHoras: 0, despesas: 0, impostos: 0, gastosExtras: 0, projetos: {} };
            }
            colab.meses[mesAno].totalHoras += horas;
            colab.meses[mesAno].custoHoras += custo;

            if (!colab.meses[mesAno].projetos![nomeProjeto]) {
              colab.meses[mesAno].projetos![nomeProjeto] = { horas: 0, custo: 0 };
            }
            colab.meses[mesAno].projetos![nomeProjeto].horas += horas;
            colab.meses[mesAno].projetos![nomeProjeto].custo += custo;
          });

          // 3. ENCAIXAR MÓDULO FINANCEIRO
          const snapFinancas = await getDocs(collection(db, "financas"));
          
          snapFinancas.forEach((docSnap) => {
            const fin = docSnap.data();
            const idProjFin = fin.projetoId;

            if (!listaIdsProjetosAtivos.includes(idProjFin)) return;

            const valor = Number(fin.valor) || 0;
            const tipo = String(fin.tipo).toLowerCase();

            let mesAnoFin = "Indefinido";
            if (fin.data) {
              const dataF = fin.data.toDate();
              mesAnoFin = `${String(dataF.getMonth() + 1).padStart(2, "0")}/${dataF.getFullYear()}`;
            }

            const proj = mapeamentoProjetos[idProjFin];

            if (!proj.meses[mesAnoFin]) {
              proj.meses[mesAnoFin] = { mesAno: mesAnoFin, totalHoras: 0, custoHoras: 0, despesas: 0, impostos: 0, gastosExtras: 0 };
            }

            if (tipo === "faturamento" || tipo === "receita" || tipo === "entrada" || tipo === "gasto extra" || tipo === "gasto_extra") {
              proj.gastosExtrasGeral += valor;
              proj.meses[mesAnoFin].gastosExtras += valor;
            } else if (tipo === "imposto") {
              proj.impostosGeral += valor;
              proj.meses[mesAnoFin].impostos += valor;
            } else {
              proj.despesasGeral += valor;
              proj.meses[mesAnoFin].despesas += valor;
            }
          });

          setDadosProjetos(Object.values(mapeamentoProjetos));
          setDadosColaboradores(Object.values(mapeamentoColaboradores));
        } catch (err) {
          console.error("Erro ao computar métricas BI: ", err);
        } finally {
          setCarregando(false);
        }
      };

      processarMetricasBI();
    }, [])
  );

  // ====================================================================================
  // GERADORES DE PDF - PROJETOS
  // ====================================================================================

  const gerarPDFProjeto = async (p: ItemProjetoBI) => {
    const orcamentoTeto = p.valor_orcamento || 0;
    const totalGastoComputado = p.custoHorasGeral + p.despesasGeral + p.impostosGeral + p.gastosExtrasGeral;
    const saldoDoContrato = orcamentoTeto - totalGastoComputado;
    const porcentagemConsumida = orcamentoTeto > 0 ? (totalGastoComputado / orcamentoTeto) * 100 : 0;
    const corSaldo = saldoDoContrato >= 0 ? "#10b981" : "#ff4444";

    const linhasTabelaMeses = Object.values(p.meses).map((m) => {
      const totalMes = m.custoHoras + m.despesas + m.impostos + m.gastosExtras;
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${m.mesAno}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${m.totalHoras}h</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R$ ${m.custoHoras.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R$ ${m.despesas.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R$ ${m.impostos.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R$ ${m.gastosExtras.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; color: #ff4444;">R$ ${totalMes.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <html>
        <head><meta charset="utf-8">
          <style>body { font-family: Arial, sans-serif; color: #333; padding: 20px; } .header { border-bottom: 3px solid ${p.cor}; padding-bottom: 10px; margin-bottom: 20px; } .grid-resumo { display: flex; justify-content: space-between; margin-bottom: 30px; } .card-resumo { width: 30%; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; text-align: center; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th { background-color: #f1f3f5; padding: 10px; text-align: left; font-size: 12px; border-bottom: 2px solid #dee2e6; }</style>
        </head>
        <body>
          <div class="header"><h2>Relatório Analítico de Projeto</h2><div>Projeto: <strong>${p.nome}</strong></div></div>
          <div class="grid-resumo">
            <div class="card-resumo" style="border-top: 4px solid #00849e;"><div>Verba Orçada</div><strong>R$ ${orcamentoTeto.toFixed(2)}</strong></div>
            <div class="card-resumo" style="border-top: 4px solid #ff4444;"><div>Total Gasto</div><strong>R$ ${totalGastoComputado.toFixed(2)} (${porcentagemConsumida.toFixed(1)}%)</strong></div>
            <div class="card-resumo" style="border-top: 4px solid ${corSaldo};"><div>Saldo Contrato</div><strong style="color: ${corSaldo};">R$ ${saldoDoContrato.toFixed(2)}</strong></div>
          </div>
          <h3>Demonstrativo Mensal de Custos</h3>
          <table>
            <thead><tr><th>Mês/Ano</th><th>Horas</th><th>Mão de Obra</th><th>Despesas</th><th>Impostos</th><th>Gastos Extras</th><th>Total Mês</th></tr></thead>
            <tbody>${linhasTabelaMeses}</tbody>
          </table>
        </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Projeto_${p.nome}` });
    } catch (e) { console.error(e); }
  };

  const gerarPDFTodosProjetos = async () => {
    if (dadosProjetos.length === 0) return;
    const blocosProjetosHTML = dadosProjetos.map((p) => {
      const orcamentoTeto = p.valor_orcamento || 0;
      const totalGastoComputado = p.custoHorasGeral + p.despesasGeral + p.impostosGeral + p.gastosExtrasGeral;
      const saldoDoContrato = orcamentoTeto - totalGastoComputado;
      const porcentagemConsumida = orcamentoTeto > 0 ? (totalGastoComputado / orcamentoTeto) * 100 : 0;
      const corSaldo = saldoDoContrato >= 0 ? "#10b981" : "#ff4444";

      const linhasMeses = Object.values(p.meses).map((m) => {
        const totalMes = m.custoHoras + m.despesas + m.impostos + m.gastosExtras;
        return `<tr><td style="padding:6px; border-bottom:1px solid #eee;">${m.mesAno}</td><td style="padding:6px; border-bottom:1px solid #eee; text-align:center;">${m.totalHoras}h</td><td style="padding:6px; border-bottom:1px solid #eee; text-align:right;">R$ ${m.custoHoras.toFixed(2)}</td><td style="padding:6px; border-bottom:1px solid #eee; text-align:right;">R$ ${m.despesas.toFixed(2)}</td><td style="padding:6px; border-bottom:1px solid #eee; text-align:right;">R$ ${m.impostos.toFixed(2)}</td><td style="padding:6px; border-bottom:1px solid #eee; text-align:right;">R$ ${m.gastosExtras.toFixed(2)}</td><td style="padding:6px; border-bottom:1px solid #eee; text-align:right; font-weight:bold; color:#ff4444;">R$ ${totalMes.toFixed(2)}</td></tr>`;
      }).join('');

      return `<div style="page-break-inside:avoid; border:1px solid #ddd; border-left:5px solid ${p.cor}; padding:15px; margin-bottom:25px; border-radius:4px;"><h2 style="margin-top:0;">${p.nome}</h2><p><strong>Orçamento:</strong> R$ ${orcamentoTeto.toFixed(2)} | <strong>Gasto:</strong> R$ ${totalGastoComputado.toFixed(2)} (${porcentagemConsumida.toFixed(1)}%) | <span style="color:${corSaldo};"><strong>Saldo:</strong> R$ ${saldoDoContrato.toFixed(2)}</span></p><table style="width:100%; border-collapse:collapse; font-size:12px;"><thead><tr style="background:#f7f7f7;"><th style="text-align:left; padding:6px;">Mês/Ano</th><th style="text-align:center; padding:6px;">Horas</th><th style="text-align:right; padding:6px;">Mão de Obra</th><th style="text-align:right; padding:6px;">Despesas</th><th style="text-align:right; padding:6px;">Impostos</th><th style="text-align:right; padding:6px;">Gastos Extras</th><th style="text-align:right; padding:6px;">Total</th></tr></thead><tbody>${linhasMeses || `<tr><td colspan="7" style="text-align:center; color:#999;">Sem movimentações</td></tr>`}</tbody></table></div>`;
    }).join('');

    const htmlContent = `<html><head><meta charset="utf-8"><style>body { font-family: Arial, sans-serif; padding: 20px; color: #333; }</style></head><body><div style="text-align:center; border-bottom:2px solid #000060; padding-bottom:10px; margin-bottom:30px;"><h1>Relatório Consolidado de Projetos Ativos</h1><p>Fechamento em ${new Date().toLocaleDateString('pt-BR')}</p></div>${blocosProjetosHTML}</body></html>`;
    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Consolidado_Projetos' });
    } catch (e) { console.error(e); }
  };

  // ====================================================================================
  // NOVO: GERADORES DE PDF - COLABORADORES (Apropriação Mês -> Projeto -> Horas)
  // ====================================================================================

  // PDF Individual do Colaborador
  const gerarPDFColaborador = async (colab: ItemColaboradorBI) => {
    let linhasTabela = "";

    Object.values(colab.meses).forEach((m) => {
      const projetosDoMes = Object.entries(m.projetos || {});

      if (projetosDoMes.length === 0) {
        linhasTabela += `<tr><td style="padding: 8px;"><strong>${m.mesAno}</strong></td><td colspan="3" style="color:#999; text-align:center;">Sem horas registradas</td></tr>`;
        return;
      }

      projetosDoMes.forEach(([nomeProj, dadosP], idx) => {
        // Exibe o Mês/Ano apenas na primeira linha daquele mês
        const exibicaoMes = idx === 0 ? `<strong>${m.mesAno}</strong>` : `<span style="color: #ccc;">↳</span>`;
        linhasTabela += `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${exibicaoMes}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #111;">${nomeProj}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold;">${dadosP.horas}h</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; color: #555;">R$ ${dadosP.custo.toFixed(2)}</td>
          </tr>
        `;
      });

      // Linha de Subtotal do Mês
      if (projetosDoMes.length > 1) {
        linhasTabela += `
          <tr style="background-color: #f8f9fa; font-size: 11px;">
            <td colspan="2" style="text-align: right; padding: 6px 8px;"><em>Total trabalhado em ${m.mesAno}:</em></td>
            <td style="text-align: center; padding: 6px 8px; font-weight: bold; color: #00849e;">${m.totalHoras}h</td>
            <td style="text-align: right; padding: 6px 8px; font-weight: bold; color: #00849e;">R$ ${m.custoHoras.toFixed(2)}</td>
          </tr>
        `;
      }
    });

    const htmlContent = `
      <html>
        <head><meta charset="utf-8">
          <style>body { font-family: Arial, sans-serif; color: #333; padding: 20px; } table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; } th { background-color: #f1f3f5; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }</style>
        </head>
        <body>
          <div style="border-bottom: 3px solid #86EBFF; padding-bottom: 10px; margin-bottom: 20px;">
            <h2>Relatório de Apropriação de Horas</h2>
            <div>Colaborador: <strong style="font-size: 18px; color: #000060;">${colab.nome}</strong></div>
            <div style="margin-top: 4px; font-size: 13px; color: #666;">Total Geral Acumulado: <strong>${colab.totalHorasGeral}h</strong> (Custo Técnico Gerado: R$ ${colab.custoGeral.toFixed(2)})</div>
          </div>
          <table>
            <thead><tr><th style="width:18%;">Mês/Ano</th><th style="width:46%;">Projeto Atendido</th><th style="width:18%; text-align:center;">Horas</th><th style="width:18%; text-align:right;">Custo</th></tr></thead>
            <tbody>${linhasTabela || `<tr><td colspan="4" style="text-align:center; padding:20px; color:#999;">Nenhum apontamento.</td></tr>`}</tbody>
          </table>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Horas_${colab.nome}` });
    } catch (e) { console.error(e); }
  };

  // PDF Consolidado Geral de Todos os Colaboradores
  const gerarPDFTodosColaboradores = async () => {
    if (dadosColaboradores.length === 0) return;

    const blocosUsuariosHTML = dadosColaboradores.map((colab) => {
      let linhasTabela = "";

      Object.values(colab.meses).forEach((m) => {
        const projetosDoMes = Object.entries(m.projetos || {});

        if (projetosDoMes.length === 0) {
          linhasTabela += `<tr><td style="padding: 6px;"><strong>${m.mesAno}</strong></td><td colspan="3" style="color:#999; text-align:center;">Sem horas registradas</td></tr>`;
          return;
        }

        projetosDoMes.forEach(([nomeProj, dadosP], idx) => {
          const exibicaoMes = idx === 0 ? `<strong>${m.mesAno}</strong>` : `<span style="color: #ccc;">↳</span>`;
          linhasTabela += `
            <tr>
              <td style="padding: 6px; border-bottom: 1px solid #eee;">${exibicaoMes}</td>
              <td style="padding: 6px; border-bottom: 1px solid #eee; color: #111;">${nomeProj}</td>
              <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold;">${dadosP.horas}h</td>
              <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: right; color: #555;">R$ ${dadosP.custo.toFixed(2)}</td>
            </tr>
          `;
        });

        if (projetosDoMes.length > 1) {
          linhasTabela += `
            <tr style="background-color: #f8f9fa; font-size: 11px;">
              <td colspan="2" style="text-align: right; padding: 4px 6px;"><em>Subtotal de ${m.mesAno}:</em></td>
              <td style="text-align: center; padding: 4px 6px; font-weight: bold; color: #00849e;">${m.totalHoras}h</td>
              <td style="text-align: right; padding: 4px 6px; font-weight: bold; color: #00849e;">R$ ${m.custoHoras.toFixed(2)}</td>
            </tr>
          `;
        }
      });

      return `
        <div style="page-break-inside: avoid; border: 1px solid #ddd; border-left: 5px solid #00849e; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 12px;">
            <h2 style="margin: 0; color: #000060; font-size: 20px;">${colab.nome}</h2>
            <span style="font-size: 13px; color: #555;">Acumulado Total: <strong>${colab.totalHorasGeral}h</strong> (R$ ${colab.custoGeral.toFixed(2)})</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f7f7f7;">
                <th style="width: 18%; text-align: left; padding: 6px;">Mês/Ano</th>
                <th style="width: 46%; text-align: left; padding: 6px;">Projeto Atendido</th>
                <th style="width: 18%; text-align: center; padding: 6px;">Horas</th>
                <th style="width: 18%; text-align: right; padding: 6px;">Custo Técnico</th>
              </tr>
            </thead>
            <tbody>${linhasTabela || `<tr><td colspan="4" style="text-align: center; color: #999; padding: 10px;">Nenhum apontamento.</td></tr>`}</tbody>
          </table>
        </div>
      `;
    }).join('');

    const htmlGeral = `
      <html>
        <head><meta charset="utf-8">
          <style>body { font-family: Arial, sans-serif; padding: 20px; color: #333; }</style>
        </head>
        <body>
          <div style="text-align: center; border-bottom: 2px solid #000060; padding-bottom: 10px; margin-bottom: 30px;">
            <h1>Folha de Apropriação de Horas (Geral)</h1>
            <p>Consolidado por Colaborador — Fechamento em ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          ${blocosUsuariosHTML}
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlGeral });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Consolidado_Colaboradores' });
    } catch (e) { console.error(e); }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#000060", "#3232B5", "#00007D"]} style={styles.container}>
        <AppHeader
          nomeUsuario={perfil?.nome}
          onLogout={async () => await logout()}
          mostrarVoltar={true}
          onVoltar={() => navigation.navigate("TelaGestorInicial")}
        />

        {/* 💡 BOTÃO DO PDF ALTERNÁVEL (Muda conforme a aba) */}
        {!carregando && abaAtiva === "projetos" && (
          <TouchableOpacity style={styles.btnPdfGlobal} onPress={gerarPDFTodosProjetos}>
            <Ionicons name="cloud-download" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.txtPdfGlobal}>Exportar DRE Geral (Todos os Projetos)</Text>
          </TouchableOpacity>
        )}

        {!carregando && abaAtiva === "colaboradores" && (
          <TouchableOpacity style={[styles.btnPdfGlobal, { backgroundColor: "#006478" }]} onPress={gerarPDFTodosColaboradores}>
            <Ionicons name="cloud-download" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.txtPdfGlobal}>Exportar Folha de Horas (Todos os Colaboradores)</Text>
          </TouchableOpacity>
        )}

        {/* Abas */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tabButton, abaAtiva === "projetos" && styles.tabButtonAtivo]} onPress={() => setAbaAtiva("projetos")}>
            <Ionicons name="cube" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.tabText}>Por Projeto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, abaAtiva === "colaboradores" && styles.tabButtonAtivo]} onPress={() => setAbaAtiva("colaboradores")}>
            <Ionicons name="people" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.tabText}>Por Colaborador</Text>
          </TouchableOpacity>
        </View>

        {carregando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#86EBFF" />
            <Text style={styles.loadingText}>Processando cruzamento de horas...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollWrapper}>
            
            {/* ABA 1: PROJETOS */}
            {abaAtiva === "projetos" && dadosProjetos.map((p) => {
              const aberto = !!expandidos[p.id];
              const orcamentoTeto = p.valor_orcamento || 0; 
              const totalGastoComputado = p.custoHorasGeral + p.despesasGeral + p.impostosGeral + p.gastosExtrasGeral;
              const saldoDoContrato = orcamentoTeto - totalGastoComputado;
              const porcentagemConsumida = orcamentoTeto > 0 ? (totalGastoComputado / orcamentoTeto) * 100 : 0;

              let corStatusOrcamento = p.cor;
              let estáEstourado = false;

              if (porcentagemConsumida >= 80 && porcentagemConsumida < 100) corStatusOrcamento = "#ffb300"; 
              else if (porcentagemConsumida >= 100) { corStatusOrcamento = "#ff4444"; estáEstourado = true; }

              return (
                <View key={p.id} style={[styles.cardBI, { borderLeftColor: p.cor, borderColor: estáEstourado ? "rgba(255, 68, 68, 0.4)" : "rgba(255,255,255,0.05)", borderWidth: estáEstourado ? 1 : 0 }]}>
                  <TouchableOpacity style={styles.cardHeader} onPress={() => toggleExpandir(p.id)}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <View style={[styles.indicatorColor, { backgroundColor: p.cor }]} />
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{p.nome}</Text>
                        <Text style={styles.cardSub}>
                          Saldo Contrato: <Text style={{ color: saldoDoContrato >= 0 ? "#10b981" : "#ff4444", fontWeight: "700" }}>R$ {saldoDoContrato.toFixed(2)}</Text>
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.pdfButton} onPress={(e) => { e.stopPropagation(); gerarPDFProjeto(p); }}>
                      <Ionicons name="document-text" size={22} color="#86EBFF" />
                    </TouchableOpacity>

                    <Ionicons name={aberto ? "chevron-up" : "chevron-down"} size={22} color={p.cor} />
                  </TouchableOpacity>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                      <View style={[styles.progressBarFill, { backgroundColor: corStatusOrcamento, width: `${Math.min(porcentagemConsumida, 100)}%` }]} />
                    </View>
                    <View style={styles.progressTextRow}>
                      <Text style={styles.txtProgressLeft}>Gasto: R$ {totalGastoComputado.toFixed(2)} / R$ {orcamentoTeto.toFixed(2)}</Text>
                      <Text style={[styles.txtProgressRight, { color: corStatusOrcamento }]}>{porcentagemConsumida.toFixed(1)}%</Text>
                    </View>
                  </View>

                  {aberto && (
                    <View style={styles.cardContent}>
                      <Text style={[styles.sectionDivider, { color: p.cor }]}>Balanço Financeiro por Mês</Text>
                      {Object.values(p.meses).map((m) => {
                        const totalMes = m.custoHoras + m.despesas + m.impostos + m.gastosExtras;
                        return (
                          <View key={m.mesAno} style={styles.boxMesFinanceiro}>
                            <View style={styles.rowDREHeader}>
                              <Text style={styles.txtMesTitle}>{m.mesAno}</Text>
                              <Text style={{ color: "#ff4444", fontWeight: "700", fontSize: 15 }}>Custo Mês: R$ {totalMes.toFixed(2)}</Text>
                            </View>
                            <View style={styles.dreGrid}>
                              <Text style={styles.txtDreItem}>• Horas Dedicadas: {m.totalHoras}h (Custo: R$ {m.custoHoras.toFixed(2)})</Text>
                              <Text style={styles.txtDreItem}>• Despesas Extras: R$ {m.despesas.toFixed(2)}</Text>
                              <Text style={styles.txtDreItem}>• Impostos Retidos: R$ {m.impostos.toFixed(2)}</Text>
                              <Text style={styles.txtDreItem}>• Gastos Extras: R$ {m.gastosExtras.toFixed(2)}</Text>
                            </View>
                          </View>
                        );
                      })}
                      {Object.keys(p.meses).length === 0 && <Text style={styles.txtVazio}>Sem lançamentos.</Text>}
                    </View>
                  )}
                </View>
              );
            })}

            {/* ABA 2: COLABORADORES */}
            {abaAtiva === "colaboradores" && dadosColaboradores.map((colab) => {
              const aberto = !!expandidos[colab.id];
              return (
                <View key={colab.id} style={styles.cardBI}>
                  <TouchableOpacity style={styles.cardHeader} onPress={() => toggleExpandir(colab.id)}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <Ionicons name="person-circle" size={32} color="#86EBFF" style={{ marginRight: 10 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{colab.nome}</Text>
                        <Text style={styles.cardSub}>Acumulado total: {colab.totalHorasGeral}h</Text>
                      </View>
                    </View>

                    {/* 💡 NOVO: Botão de PDF individual do profissional */}
                    <TouchableOpacity style={styles.pdfButton} onPress={(e) => { e.stopPropagation(); gerarPDFColaborador(colab); }}>
                      <Ionicons name="document-text" size={22} color="#86EBFF" />
                    </TouchableOpacity>

                    <Ionicons name={aberto ? "chevron-up" : "chevron-down"} size={22} color="#86EBFF" />
                  </TouchableOpacity>

                  {aberto && (
                    <View style={styles.cardContent}>
                      {Object.values(colab.meses).map((m) => (
                        <View key={m.mesAno} style={styles.boxMesColab}>
                          <Text style={styles.txtMesHeader}>{m.mesAno} — Total no mês: {m.totalHoras}h</Text>
                          {Object.entries(m.projetos || {}).map(([nomeProj, dadosP]) => (
                            <View key={nomeProj} style={styles.rowProjetoColab}>
                              <Text style={styles.txtProjNome} numberOfLines={1}>• {nomeProj}</Text>
                              <Text style={styles.txtProjVal}>{dadosP.horas}h | R$ {dadosP.custo.toFixed(2)}</Text>
                            </View>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}

          </ScrollView>
        )}
        <AppCopyrigth />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  btnPdfGlobal: { flexDirection: "row", backgroundColor: "#00849e", marginHorizontal: 20, marginTop: 10, padding: 12, borderRadius: 8, justifyContent: "center", alignItems: "center", elevation: 2 },
  txtPdfGlobal: { color: "#fff", fontWeight: "700", fontSize: 14 },
  tabContainer: { flexDirection: "row", marginHorizontal: 20, marginVertical: 12, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, padding: 4 },
  tabButton: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 10, borderRadius: 6 },
  tabButtonAtivo: { backgroundColor: "#00849e" },
  tabText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#86EBFF", marginTop: 10, fontSize: 16 },
  scrollWrapper: { paddingHorizontal: 20, paddingBottom: 25 },
  cardBI: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 10, marginBottom: 12, overflow: "hidden", borderLeftWidth: 4, borderLeftColor: "#86EBFF" },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 15 },
  indicatorColor: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  cardTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  cardSub: { color: "#ccc", fontSize: 13, marginTop: 2 },
  pdfButton: { padding: 8, marginRight: 4 },
  cardContent: { backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 15, paddingVertical: 12 },
  sectionDivider: { fontWeight: "600", fontSize: 13, marginBottom: 8, textTransform: "uppercase" },
  txtVazio: { color: "#aaa", fontSize: 13, fontStyle: "italic", textAlign: "center", marginVertical: 5 },
  boxMesColab: { marginBottom: 12, backgroundColor: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 6 },
  txtMesHeader: { color: "#86EBFF", fontWeight: "700", fontSize: 14, marginBottom: 6 },
  rowProjetoColab: { flexDirection: "row", justifyContent: "space-between", marginLeft: 10, paddingVertical: 4 },
  txtProjNome: { color: "#fff", fontSize: 14, flex: 0.6 },
  txtProjVal: { color: "#10b981", fontSize: 14, fontWeight: "500", flex: 0.4, textAlign: "right" },
  boxMesFinanceiro: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 6, padding: 10, marginBottom: 10 },
  rowDREHeader: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)", paddingBottom: 4, marginBottom: 6 },
  txtMesTitle: { color: "#fff", fontWeight: "700", fontSize: 15 },
  dreGrid: { paddingLeft: 6 },
  txtDreItem: { color: "#ddd", fontSize: 13, marginVertical: 2 },
  progressContainer: { paddingHorizontal: 15, paddingBottom: 12 },
  progressBarBackground: { height: 8, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 4 },
  progressTextRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  txtProgressLeft: { color: "#aaa", fontSize: 12 },
  txtProgressRight: { fontSize: 12, fontWeight: "700" }
});

