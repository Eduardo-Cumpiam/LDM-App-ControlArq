// PdfGeradores.ts
// Funções utilitárias para geração de PDFs do Painel Analítico
// ====================================================================================

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { colors } from '../styles/colors';
import { ItemProjetoBI, ItemColaboradorBI } from './tipos';

// ============================================
// PDF INDIVIDUAL DE PROJETO
// ============================================
export const gerarPDFProjeto = async (p: ItemProjetoBI) => {
  const orcamentoTeto = p.valor_orcamento || 0;
  const totalGastoComputado = p.custoHorasGeral + p.despesasGeral + p.impostosGeral + p.gastosExtrasGeral;
  const saldoDoContrato = orcamentoTeto - totalGastoComputado;
  const porcentagemConsumida = orcamentoTeto > 0 ? (totalGastoComputado / orcamentoTeto) * 100 : 0;
  const corSaldo = saldoDoContrato >= 0 ? "#10b981" : colors.danger;

  const linhasTabelaMeses = Object.values(p.meses).map((m) => {
    const totalMes = m.custoHoras + m.despesas + m.impostos + m.gastosExtras;
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid ${colors.cardBorder}; font-weight: bold;">${m.mesAno}</td>
        <td style="padding: 10px; border-bottom: 1px solid ${colors.cardBorder}; text-align: center;">${m.totalHoras}h</td>
        <td style="padding: 10px; border-bottom: 1px solid ${colors.cardBorder}; text-align: right;">R$ ${m.custoHoras.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid ${colors.cardBorder}; text-align: right;">R$ ${m.despesas.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid ${colors.cardBorder}; text-align: right;">R$ ${m.impostos.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid ${colors.cardBorder}; text-align: right;">R$ ${m.gastosExtras.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid ${colors.cardBorder}; text-align: right; font-weight: bold; color: ${colors.danger};">R$ ${totalMes.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <html>
      <head><meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: ${colors.textPrimary}; padding: 20px; }
          .header { border-bottom: 3px solid ${p.cor}; padding-bottom: 10px; margin-bottom: 20px; }
          .grid-resumo { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .card-resumo { width: 30%; background: ${colors.background}; border: 1px solid ${colors.cardBorder}; border-radius: 6px; padding: 15px; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: ${colors.inputBackground}; padding: 10px; text-align: left; font-size: 12px; border-bottom: 2px solid ${colors.cardBorder}; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Relatório Analítico de Projeto</h2>
          <div>Projeto: <strong>${p.nome}</strong></div>
        </div>
        <div class="grid-resumo">
          <div class="card-resumo" style="border-top: 4px solid ${colors.primary};">
            <div>Verba Orçada</div>
            <strong>R$ ${orcamentoTeto.toFixed(2)}</strong>
          </div>
          <div class="card-resumo" style="border-top: 4px solid ${colors.danger};">
            <div>Total Gasto</div>
            <strong>R$ ${totalGastoComputado.toFixed(2)} (${porcentagemConsumida.toFixed(1)}%)</strong>
          </div>
          <div class="card-resumo" style="border-top: 4px solid ${corSaldo};">
            <div>Saldo Contrato</div>
            <strong style="color: ${corSaldo};">R$ ${saldoDoContrato.toFixed(2)}</strong>
          </div>
        </div>
        <h3>Demonstrativo Mensal de Custos</h3>
        <table>
          <thead>
            <tr>
              <th>Mês/Ano</th>
              <th>Horas</th>
              <th>Mão de Obra</th>
              <th>Despesas</th>
              <th>Impostos</th>
              <th>Gastos Extras</th>
              <th>Total Mês</th>
            </tr>
          </thead>
          <tbody>${linhasTabelaMeses}</tbody>
        </table>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Projeto_${p.nome}` });
  } catch (e) {
    console.error("Erro ao gerar PDF do projeto:", e);
  }
};

// ============================================
// PDF CONSOLIDADO DE TODOS OS PROJETOS
// ============================================
export const gerarPDFTodosProjetos = async (dadosProjetos: ItemProjetoBI[]) => {
  if (dadosProjetos.length === 0) return;

  const blocosProjetosHTML = dadosProjetos.map((p) => {
    const orcamentoTeto = p.valor_orcamento || 0;
    const totalGastoComputado = p.custoHorasGeral + p.despesasGeral + p.impostosGeral + p.gastosExtrasGeral;
    const saldoDoContrato = orcamentoTeto - totalGastoComputado;
    const porcentagemConsumida = orcamentoTeto > 0 ? (totalGastoComputado / orcamentoTeto) * 100 : 0;
    const corSaldo = saldoDoContrato >= 0 ? "#10b981" : colors.danger;

    const linhasMeses = Object.values(p.meses).map((m) => {
      const totalMes = m.custoHoras + m.despesas + m.impostos + m.gastosExtras;
      return `
        <tr>
          <td style="padding:6px; border-bottom:1px solid ${colors.cardBorder};">${m.mesAno}</td>
          <td style="padding:6px; border-bottom:1px solid ${colors.cardBorder}; text-align:center;">${m.totalHoras}h</td>
          <td style="padding:6px; border-bottom:1px solid ${colors.cardBorder}; text-align:right;">R$ ${m.custoHoras.toFixed(2)}</td>
          <td style="padding:6px; border-bottom:1px solid ${colors.cardBorder}; text-align:right;">R$ ${m.despesas.toFixed(2)}</td>
          <td style="padding:6px; border-bottom:1px solid ${colors.cardBorder}; text-align:right;">R$ ${m.impostos.toFixed(2)}</td>
          <td style="padding:6px; border-bottom:1px solid ${colors.cardBorder}; text-align:right;">R$ ${m.gastosExtras.toFixed(2)}</td>
          <td style="padding:6px; border-bottom:1px solid ${colors.cardBorder}; text-align:right; font-weight:bold; color:${colors.danger};">R$ ${totalMes.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    return `
      <div style="page-break-inside:avoid; border:1px solid ${colors.cardBorder}; border-left:5px solid ${p.cor}; padding:15px; margin-bottom:25px; border-radius:4px;">
        <h2 style="margin-top:0;">${p.nome}</h2>
        <p>
          <strong>Orçamento:</strong> R$ ${orcamentoTeto.toFixed(2)} | 
          <strong>Gasto:</strong> R$ ${totalGastoComputado.toFixed(2)} (${porcentagemConsumida.toFixed(1)}%) | 
          <span style="color:${corSaldo};"><strong>Saldo:</strong> R$ ${saldoDoContrato.toFixed(2)}</span>
        </p>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:${colors.inputBackground};">
              <th style="text-align:left; padding:6px;">Mês/Ano</th>
              <th style="text-align:center; padding:6px;">Horas</th>
              <th style="text-align:right; padding:6px;">Mão de Obra</th>
              <th style="text-align:right; padding:6px;">Despesas</th>
              <th style="text-align:right; padding:6px;">Impostos</th>
              <th style="text-align:right; padding:6px;">Gastos Extras</th>
              <th style="text-align:right; padding:6px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${linhasMeses || `<tr><td colspan="7" style="text-align:center; color:${colors.textLight};">Sem movimentações</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  const htmlContent = `
    <html>
      <head><meta charset="utf-8">
        <style>body { font-family: Arial, sans-serif; padding: 20px; color: ${colors.textPrimary}; }</style>
      </head>
      <body>
        <div style="text-align:center; border-bottom:2px solid ${colors.primary}; padding-bottom:10px; margin-bottom:30px;">
          <h1>Relatório Consolidado de Projetos Ativos</h1>
          <p>Fechamento em ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        ${blocosProjetosHTML}
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Consolidado_Projetos' });
  } catch (e) {
    console.error("Erro ao gerar PDF consolidado de projetos:", e);
  }
};

// ============================================
// PDF INDIVIDUAL DE COLABORADOR
// ============================================
export const gerarPDFColaborador = async (colab: ItemColaboradorBI) => {
  let linhasTabela = "";

  Object.values(colab.meses).forEach((m) => {
    const projetosDoMes = Object.entries(m.projetos || {});

    if (projetosDoMes.length === 0) {
      linhasTabela += `
        <tr>
          <td style="padding: 8px;"><strong>${m.mesAno}</strong></td>
          <td colspan="3" style="color:${colors.textLight}; text-align:center;">Sem horas registradas</td>
        </tr>
      `;
      return;
    }

    projetosDoMes.forEach(([nomeProj, dadosP], idx) => {
      const exibicaoMes = idx === 0 
        ? `<strong>${m.mesAno}</strong>` 
        : `<span style="color: ${colors.textLight};">↳</span>`;
      
      linhasTabela += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid ${colors.cardBorder};">${exibicaoMes}</td>
          <td style="padding: 8px; border-bottom: 1px solid ${colors.cardBorder}; color: ${colors.textPrimary};">${nomeProj}</td>
          <td style="padding: 8px; border-bottom: 1px solid ${colors.cardBorder}; text-align: center; font-weight: bold;">${dadosP.horas}h</td>
          <td style="padding: 8px; border-bottom: 1px solid ${colors.cardBorder}; text-align: right; color: ${colors.textSecondary};">R$ ${dadosP.custo.toFixed(2)}</td>
        </tr>
      `;
    });

    // Linha de Subtotal do Mês (apenas se houver mais de 1 projeto)
    if (projetosDoMes.length > 1) {
      linhasTabela += `
        <tr style="background-color: ${colors.background}; font-size: 11px;">
          <td colspan="2" style="text-align: right; padding: 6px 8px;"><em>Total trabalhado em ${m.mesAno}:</em></td>
          <td style="text-align: center; padding: 6px 8px; font-weight: bold; color: ${colors.primary};">${m.totalHoras}h</td>
          <td style="text-align: right; padding: 6px 8px; font-weight: bold; color: ${colors.primary};">R$ ${m.custoHoras.toFixed(2)}</td>
        </tr>
      `;
    }
  });

  const htmlContent = `
    <html>
      <head><meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: ${colors.textPrimary}; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th { background-color: ${colors.inputBackground}; padding: 10px; text-align: left; border-bottom: 2px solid ${colors.cardBorder}; }
        </style>
      </head>
      <body>
        <div style="border-bottom: 3px solid ${colors.primarySoft}; padding-bottom: 10px; margin-bottom: 20px;">
          <h2>Relatório de Apropriação de Horas</h2>
          <div>Colaborador: <strong style="font-size: 18px; color: ${colors.primary};">${colab.nome}</strong></div>
          <div style="margin-top: 4px; font-size: 13px; color: ${colors.textSecondary};">
            Total Geral Acumulado: <strong>${colab.totalHorasGeral}h</strong> 
            (Custo Técnico Gerado: R$ ${colab.custoGeral.toFixed(2)})
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:18%;">Mês/Ano</th>
              <th style="width:46%;">Projeto Atendido</th>
              <th style="width:18%; text-align:center;">Horas</th>
              <th style="width:18%; text-align:right;">Custo</th>
            </tr>
          </thead>
          <tbody>
            ${linhasTabela || `<tr><td colspan="4" style="text-align:center; padding:20px; color:${colors.textLight};">Nenhum apontamento.</td></tr>`}
          </tbody>
        </table>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Horas_${colab.nome}` });
  } catch (e) {
    console.error("Erro ao gerar PDF do colaborador:", e);
  }
};

// ============================================
// PDF CONSOLIDADO DE TODOS OS COLABORADORES
// ============================================
export const gerarPDFTodosColaboradores = async (dadosColaboradores: ItemColaboradorBI[]) => {
  if (dadosColaboradores.length === 0) return;

  const blocosUsuariosHTML = dadosColaboradores.map((colab) => {
    let linhasTabela = "";

    Object.values(colab.meses).forEach((m) => {
      const projetosDoMes = Object.entries(m.projetos || {});

      if (projetosDoMes.length === 0) {
        linhasTabela += `
          <tr>
            <td style="padding: 6px;"><strong>${m.mesAno}</strong></td>
            <td colspan="3" style="color:${colors.textLight}; text-align:center;">Sem horas registradas</td>
          </tr>
        `;
        return;
      }

      projetosDoMes.forEach(([nomeProj, dadosP], idx) => {
        const exibicaoMes = idx === 0 
          ? `<strong>${m.mesAno}</strong>` 
          : `<span style="color: ${colors.textLight};">↳</span>`;
        
        linhasTabela += `
          <tr>
            <td style="padding: 6px; border-bottom: 1px solid ${colors.cardBorder};">${exibicaoMes}</td>
            <td style="padding: 6px; border-bottom: 1px solid ${colors.cardBorder}; color: ${colors.textPrimary};">${nomeProj}</td>
            <td style="padding: 6px; border-bottom: 1px solid ${colors.cardBorder}; text-align: center; font-weight: bold;">${dadosP.horas}h</td>
            <td style="padding: 6px; border-bottom: 1px solid ${colors.cardBorder}; text-align: right; color: ${colors.textSecondary};">R$ ${dadosP.custo.toFixed(2)}</td>
          </tr>
        `;
      });

      // Subtotal do mês
      if (projetosDoMes.length > 1) {
        linhasTabela += `
          <tr style="background-color: ${colors.background}; font-size: 11px;">
            <td colspan="2" style="text-align: right; padding: 4px 6px;"><em>Subtotal de ${m.mesAno}:</em></td>
            <td style="text-align: center; padding: 4px 6px; font-weight: bold; color: ${colors.primary};">${m.totalHoras}h</td>
            <td style="text-align: right; padding: 4px 6px; font-weight: bold; color: ${colors.primary};">R$ ${m.custoHoras.toFixed(2)}</td>
          </tr>
        `;
      }
    });

    return `
      <div style="page-break-inside: avoid; border: 1px solid ${colors.cardBorder}; border-left: 5px solid ${colors.primary}; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid ${colors.cardBorder}; padding-bottom: 8px; margin-bottom: 12px;">
          <h2 style="margin: 0; color: ${colors.primary}; font-size: 20px;">${colab.nome}</h2>
          <span style="font-size: 13px; color: ${colors.textSecondary};">
            Acumulado Total: <strong>${colab.totalHorasGeral}h</strong> (R$ ${colab.custoGeral.toFixed(2)})
          </span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: ${colors.inputBackground};">
              <th style="width: 18%; text-align: left; padding: 6px;">Mês/Ano</th>
              <th style="width: 46%; text-align: left; padding: 6px;">Projeto Atendido</th>
              <th style="width: 18%; text-align: center; padding: 6px;">Horas</th>
              <th style="width: 18%; text-align: right; padding: 6px;">Custo Técnico</th>
            </tr>
          </thead>
          <tbody>
            ${linhasTabela || `<tr><td colspan="4" style="text-align: center; color: ${colors.textLight}; padding: 10px;">Nenhum apontamento.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  const htmlGeral = `
    <html>
      <head><meta charset="utf-8">
        <style>body { font-family: Arial, sans-serif; padding: 20px; color: ${colors.textPrimary}; }</style>
      </head>
      <body>
        <div style="text-align: center; border-bottom: 2px solid ${colors.primary}; padding-bottom: 10px; margin-bottom: 30px;">
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
  } catch (e) {
    console.error("Erro ao gerar PDF consolidado de colaboradores:", e);
  }
};
