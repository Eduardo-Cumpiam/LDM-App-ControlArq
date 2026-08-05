// AbaColaboradores.tsx
// Componente de listagem de colaboradores com apropriação de horas
// ====================================================================================

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/colors";
import { ItemColaboradorBI } from "./tipos";

interface Props {
  dados: ItemColaboradorBI[];
  expandidos: { [key: string]: boolean };
  onToggleExpandir: (id: string) => void;
  onGerarPDFColaborador: (colaborador: ItemColaboradorBI) => void;
  onGerarPDFTodos: () => void;  // 👈 NOVA PROP
}

export default function AbaColaboradores({ 
  dados, 
  expandidos, 
  onToggleExpandir, 
  onGerarPDFColaborador,
  onGerarPDFTodos  // 👈 NOVA PROP
}: Props) {
  return (
    <>
    {/* Lista de Colaboradores */}
      {dados.map((colab) => {
        const aberto = !!expandidos[colab.id];
        return (
          <View key={colab.id} style={styles.cardBI}>
            {/* Header do Card */}
            <TouchableOpacity style={styles.cardHeader} onPress={() => onToggleExpandir(colab.id)}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Ionicons 
                  name="person-circle" 
                  size={32} 
                  color={colors.primary}
                  style={{ marginRight: 10 }} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{colab.nome}</Text>
                  <Text style={styles.cardSub}>
                    Acumulado total: {colab.totalHorasGeral}h
                  </Text>
                </View>
              </View>

              {/* Botão PDF Individual */}
              <TouchableOpacity
                style={styles.pdfButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onGerarPDFColaborador(colab);
                }}
              >
                <Ionicons name="document-text" size={22} color={colors.dangerLight} />
              </TouchableOpacity>

              <Ionicons 
                name={aberto ? "chevron-up" : "chevron-down"} 
                size={22} 
                color={colors.primary} 
              />
            </TouchableOpacity>

            {/* Conteúdo Expandido: Horas por Mês/Projeto */}
            {aberto && (
              <View style={styles.cardContent}>
                {Object.values(colab.meses).map((m) => (
                  <View key={m.mesAno} style={styles.boxMesColab}>
                    <Text style={styles.txtMesHeader}>
                      {m.mesAno} — Total no mês: {m.totalHoras}h
                    </Text>
                    {Object.entries(m.projetos || {}).map(([nomeProj, dadosP]) => (
                      <View key={nomeProj} style={styles.rowProjetoColab}>
                        <Text style={styles.txtProjNome} numberOfLines={1}>
                          • {nomeProj}
                        </Text>
                        <Text style={styles.txtProjVal}>
                          {dadosP.horas}h | R$ {dadosP.custo.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
                {Object.keys(colab.meses).length === 0 && (
                  <Text style={styles.txtVazio}>Nenhum apontamento de horas.</Text>
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
  // 👇 NOVO ESTILO DO BOTÃO PDF GLOBAL
  btnPdfGlobal: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    marginBottom: 12  // espaço entre o botão e a lista
  },
  txtPdfGlobal: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14
  },
  // ... (o resto dos estilos permanece igual)
  cardBI: {
    backgroundColor: colors.backEscuro,
    borderRadius: 10,
    marginBottom: 12,
    color: colors.danger,
    overflow: "hidden",
    borderLeftWidth: 4,
    borderLeftColor: colors.primarySoft
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15
  },
  cardTitle: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: "700"
  },
  cardSub: {
    color: colors.textPrimary,
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
  txtVazio: {
    color: colors.textLight,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 5
  },
  boxMesColab: {
    marginBottom: 12,
    backgroundColor: colors.backEscuroLigth,
    padding: 10,
    borderRadius: 6
  },
  txtMesHeader: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 6
  },
  rowProjetoColab: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 10,
    paddingVertical: 4
  },
  txtProjNome: {
    color: colors.textSecondary,
    fontSize: 14,
    flex: 0.6
  },
  txtProjVal: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "500",
    flex: 0.4,
    textAlign: "right"
  }
});
