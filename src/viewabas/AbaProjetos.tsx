// AbaProjetos.tsx
// Componente de aba de projetos
// ====================================================================================

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/colors";
import { ItemProjetoBI } from "../viewabas/tipos";

interface Props {
  dados: ItemProjetoBI[];
  expandidos: { [key: string]: boolean };
  onToggleExpandir: (id: string) => void;
  onGerarPDFProjeto: (projeto: ItemProjetoBI) => void;
  onGerarPDFTodos: () => void;
}

export default function AbaProjetos({ 
  dados, 
  expandidos, 
  onToggleExpandir, 
  onGerarPDFProjeto,
  onGerarPDFTodos
}: Props) {
  return (
    <>
      {dados.map((p) => {
        const aberto = !!expandidos[p.id];
        const orcamentoTeto = p.valor_orcamento || 0;
        const totalGastoComputado = p.custoHorasGeral + p.despesasGeral + p.impostosGeral + p.gastosExtrasGeral;
        const saldoDoContrato = orcamentoTeto - totalGastoComputado;
        const porcentagemConsumida = orcamentoTeto > 0 ? (totalGastoComputado / orcamentoTeto) * 100 : 0;

        let corStatusOrcamento = p.cor;
        let estaEstourado = false;

        if (porcentagemConsumida >= 80 && porcentagemConsumida < 100) {
          corStatusOrcamento = colors.warning;
        } else if (porcentagemConsumida >= 100) {
          corStatusOrcamento = colors.danger;
          estaEstourado = true;
        }

        const corSaldo = saldoDoContrato >= 0 ? colors.success : colors.danger;

        return (
          <View
            key={p.id}
            style={[
              styles.cardBI,
              {
                borderLeftColor: p.cor,
                borderColor: estaEstourado ? colors.danger + "66" : "rgba(255,255,255,0.05)",
                borderWidth: estaEstourado ? 1 : 0
              }
            ]}
          >
            <TouchableOpacity style={styles.cardHeader} onPress={() => onToggleExpandir(p.id)}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View style={[styles.indicatorColor, { backgroundColor: p.cor }]} />
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.cardTitle, { color: p.cor }]} numberOfLines={1}>{p.nome}</Text>
                  <Text style={styles.cardSub}>
                    Saldo Contrato:{" "}
                    <Text style={{ color: corSaldo, fontWeight: "700" }}>
                      R$ {saldoDoContrato.toFixed(2)}
                    </Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.pdfButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onGerarPDFProjeto(p);
                }}
              >
                <Ionicons name="document-text" size={22} color={colors.dangerLight} />
              </TouchableOpacity>

              <Ionicons name={aberto ? "chevron-up" : "chevron-down"} size={22} color={p.cor} />
            </TouchableOpacity>

            {/* Barra de Progresso */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: corStatusOrcamento,
                      width: `${Math.min(porcentagemConsumida, 100)}%`
                    }
                  ]}
                />
              </View>
              <View style={styles.progressTextRow}>
                <Text style={styles.txtProgressLeft}>
                  Gasto: R$ {totalGastoComputado.toFixed(2)} / R$ {orcamentoTeto.toFixed(2)}
                </Text>
                <Text style={[styles.txtProgressRight, { color: corStatusOrcamento }]}>
                  {porcentagemConsumida.toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* Conteúdo Expandido */}
            {aberto && (
              <View style={styles.cardContent}>
                <Text style={[styles.sectionDivider, { color: p.cor }]}>
                  Balanço Financeiro por Mês
                </Text>
                {Object.values(p.meses).map((m) => {
                  const totalMes = m.custoHoras + m.despesas + m.impostos + m.gastosExtras;
                  return (
                    <View key={m.mesAno} style={styles.boxMesFinanceiro}>
                      <View style={styles.rowDREHeader}>
                        <Text style={styles.txtMesTitle}>{m.mesAno}</Text>
                        <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 15 }}>
                          Custo Mês: R$ {totalMes.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.dreGrid}>
                        <Text style={styles.txtDreItem}>
                          • Horas Dedicadas: {m.totalHoras}h (Custo: R$ {m.custoHoras.toFixed(2)})
                        </Text>
                        <Text style={styles.txtDreItem}>• Despesas Extras: R$ {m.despesas.toFixed(2)}</Text>
                        <Text style={styles.txtDreItem}>• Impostos Retidos: R$ {m.impostos.toFixed(2)}</Text>
                        <Text style={styles.txtDreItem}>• Gastos Extras: R$ {m.gastosExtras.toFixed(2)}</Text>
                      </View>
                    </View>
                  );
                })}
                {Object.keys(p.meses).length === 0 && (
                  <Text style={styles.txtVazio}>Sem lançamentos.</Text>
                )}
              </View>
            )}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  btnPdfGlobal: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    marginBottom: 12
  },
  txtPdfGlobal: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14
  },
  cardBI: {
    backgroundColor: colors.backEscuro,
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
    borderLeftWidth: 4
  },
  cardHeader: {
    backgroundColor: colors.backEscuro,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15
  },
  indicatorColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12
  },
  cardTitle: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: "700"
  },
  cardSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2
  },
  pdfButton: {
    padding: 8,
    marginRight: 4
  },
  cardContent: {
    backgroundColor: colors.backEscuroLigth,
    paddingHorizontal: 15,
    paddingVertical: 12
  },
  sectionDivider: {
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 8,
    textTransform: "uppercase"
  },
  txtVazio: {
    color: colors.textLight,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 5
  },
  boxMesFinanceiro: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10
  },
  rowDREHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 4,
    marginBottom: 6
  },
  txtMesTitle: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 15
  },
  dreGrid: {
    paddingLeft: 6
  },
  txtDreItem: {
    color: colors.textLight,
    fontSize: 13,
    marginVertical: 2
  },
  progressContainer: {
    paddingHorizontal: 15,
    paddingBottom: 12
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 4,
    overflow: "hidden"
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6
  },
  txtProgressLeft: {
    color: colors.textLight,
    fontSize: 12
  },
  txtProgressRight: {
    fontSize: 12,
    fontWeight: "700"
  }
});
