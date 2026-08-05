// index.tsx
// Container Principal - Módulo BI Expandido com Finanças (Painel Analítico)
// ====================================================================================

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

// Firebase
import { db } from "../services/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

// Componentes locais
import AppHeader from "../components/AppHeader";
import AppCopyrigth from "../components/AppCopyrigth";
import AbaProjetos from "../viewabas/AbaProjetos";
import AbaColaboradores from "../viewabas/AbaColaboradores";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { colors } from "../styles/colors";
import { globalStyles } from "../styles/globalStyles";
import { ItemProjetoBI, ItemColaboradorBI } from "../viewabas/tipos";
import {
  gerarPDFProjeto,
  gerarPDFTodosProjetos,
  gerarPDFColaborador,
  gerarPDFTodosColaboradores,
} from "../viewabas/PdfGeradores";

type TelaPainelNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TelaPainelAnalitico"
>;
type Props = { navigation: TelaPainelNavigationProp };

export default function TelaPainelAnalitico({ navigation }: Props) {
  const { perfil, logout } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<
    "projetos" | "colaboradores" | "pdfGenerators"
  >("projetos");
  const [expandidos, setExpandidos] = useState<{ [key: string]: boolean }>({});

  const [dadosProjetos, setDadosProjetos] = useState<ItemProjetoBI[]>([]);
  const [dadosColaboradores, setDadosColaboradores] = useState<
    ItemColaboradorBI[]
  >([]);

  const toggleExpandir = (id: string) => {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ============================================
  // LÓGICA DE CARREGAMENTO (useFocusEffect)
  // ============================================
  useFocusEffect(
    useCallback(() => {
      const processarMetricasBI = async () => {
        try {
          setCarregando(true);

          // 1. BUSCAR PROJETOS ATIVOS
          const qProjetos = query(
            collection(db, "projetos"),
            where("status", "==", "ativo"),
          );
          const snapProjetos = await getDocs(qProjetos);

          const mapeamentoProjetos: { [id: string]: ItemProjetoBI } = {};
          const listaIdsProjetosAtivos: string[] = [];

          snapProjetos.forEach((docSnap) => {
            const p = docSnap.data();
            listaIdsProjetosAtivos.push(docSnap.id);
            mapeamentoProjetos[docSnap.id] = {
              id: docSnap.id,
              nome: p.nome_projeto || "Sem nome",
              cor: p.cor_projeto || colors.primary,
              valor_orcamento: Number(p.valor_orcamento) || 0,
              totalHorasGeral: 0,
              custoHorasGeral: 0,
              despesasGeral: 0,
              impostosGeral: 0,
              gastosExtrasGeral: 0,
              meses: {},
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
          const mapeamentoColaboradores: { [id: string]: ItemColaboradorBI } =
            {};

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
              proj.meses[mesAno] = {
                mesAno,
                totalHoras: 0,
                custoHoras: 0,
                despesas: 0,
                impostos: 0,
                gastosExtras: 0,
              };
            }
            proj.meses[mesAno].totalHoras += horas;
            proj.meses[mesAno].custoHoras += custo;

            // Agregação Colaborador
            if (!mapeamentoColaboradores[idColaborador]) {
              mapeamentoColaboradores[idColaborador] = {
                id: idColaborador,
                nome: nomeColaborador,
                totalHorasGeral: 0,
                custoGeral: 0,
                meses: {},
              };
            }
            const colab = mapeamentoColaboradores[idColaborador];
            colab.totalHorasGeral += horas;
            colab.custoGeral += custo;

            if (!colab.meses[mesAno]) {
              colab.meses[mesAno] = {
                mesAno,
                totalHoras: 0,
                custoHoras: 0,
                despesas: 0,
                impostos: 0,
                gastosExtras: 0,
                projetos: {},
              };
            }
            colab.meses[mesAno].totalHoras += horas;
            colab.meses[mesAno].custoHoras += custo;

            if (!colab.meses[mesAno].projetos![nomeProjeto]) {
              colab.meses[mesAno].projetos![nomeProjeto] = {
                horas: 0,
                custo: 0,
              };
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
              proj.meses[mesAnoFin] = {
                mesAno: mesAnoFin,
                totalHoras: 0,
                custoHoras: 0,
                despesas: 0,
                impostos: 0,
                gastosExtras: 0,
              };
            }

            if (
              tipo === "faturamento" ||
              tipo === "receita" ||
              tipo === "entrada" ||
              tipo === "gasto extra" ||
              tipo === "gasto_extra"
            ) {
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
    }, []),
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <SafeAreaView style={globalStyles.container}>
      <LinearGradient
        colors={[colors.primarySoft, colors.background]}
        style={styles.container}
      >
        <AppHeader
          nomeUsuario={perfil?.nome}
          onLogout={async () => await logout()}
          mostrarVoltar={true}
          onVoltar={() => navigation.navigate("TelaGestorInicial")}
        />

        {/* Abas */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              abaAtiva === "projetos" && styles.tabButtonAtivo,
            ]}
            onPress={() => setAbaAtiva("projetos")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="cube"
              size={18}
              color={
                abaAtiva === "projetos"
                  ? colors.warningLigth
                  : colors.primaryLight
              }
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                abaAtiva === "projetos" && styles.tabTextAtivo,
              ]}
            >
              Por Projeto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              abaAtiva === "colaboradores" && styles.tabButtonAtivo,
            ]}
            onPress={() => setAbaAtiva("colaboradores")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="people"
              size={18}
              color={
                abaAtiva === "colaboradores"
                  ? colors.warningLigth
                  : colors.primaryLight
              }
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                abaAtiva === "colaboradores" && styles.tabTextAtivo,
              ]}
            >
              Por Colab
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              abaAtiva === "pdfGenerators" && styles.tabButtonAtivo,
            ]}
            onPress={() => setAbaAtiva("pdfGenerators")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="document-text"
              size={18}
              color={
                abaAtiva === "pdfGenerators"
                  ? colors.warningLigth
                  : colors.primaryLight
              }
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                abaAtiva === "pdfGenerators" && styles.tabTextAtivo,
              ]}
            >
              Gerar PDF
            </Text>
          </TouchableOpacity>
        </View>

        {carregando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primarySoft} />
            <Text style={styles.loadingText}>
              Processando cruzamento de horas...
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollWrapper}>
            {abaAtiva === "projetos" && (
              <AbaProjetos
                dados={dadosProjetos}
                expandidos={expandidos}
                onToggleExpandir={toggleExpandir}
                onGerarPDFProjeto={gerarPDFProjeto}
                onGerarPDFTodos={() => gerarPDFTodosProjetos(dadosProjetos)}
              />
            )}

            {abaAtiva === "colaboradores" && (
              <AbaColaboradores
                dados={dadosColaboradores}
                expandidos={expandidos}
                onToggleExpandir={toggleExpandir}
                onGerarPDFColaborador={gerarPDFColaborador}
                onGerarPDFTodos={() =>
                  gerarPDFTodosColaboradores(dadosColaboradores)
                }
              />
            )}
          </ScrollView>
        )}
        <AppCopyrigth />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  btnPdfGlobal: {
    flexDirection: "row",
    backgroundColor: colors.primaryLigthSoft,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  txtPdfGlobal: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: colors.primaryLigthSoft,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 6,
  },
  tabButtonAtivo: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 15,
  },
  tabTextAtivo: {
    color: colors.textLight,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.primarySoft,
    marginTop: 10,
    fontSize: 16,
  },
  scrollWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
});
