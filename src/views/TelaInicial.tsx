// TelaInicial.tsx
// Tela Inicial do aplicativo para Colaboradores
// Exibe o menu simplificado de Projetos e o Dashboard privado em tempo real.
//======================================================================================================================

import React, { useCallback, useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import AppCopyrigth from "../components/AppCopyrigth";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";
import { useBackHandlerLogout } from "../hooks/useBackHandlerLogout";
import { RootStackParamList } from "../navigation/AppNavigator";

// Firebase
import { db } from "../services/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

type TelaInicialNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaInicial">;

type Props = {
  navigation: TelaInicialNavigationProp;
};

interface DetalheMes {
  mesAno: string;
  horas: number;
}

interface CardDashboard {
  projetoId: string;
  projetoNome: string;
  totalHoras: number;
  meses: DetalheMes[];
}

export default function TelaInicial({ navigation }: Props) {
  const { usuarioLogado, perfil, logout } = useAuth();
  const [dadosDash, setDadosDash] = useState<CardDashboard[]>([]);
  const [carregandoDash, setCarregandoDash] = useState(true);

  useBackHandlerLogout();

  useFocusEffect(
    useCallback(() => {
      if (!usuarioLogado) {
        console.log('Usuário não está logado');
      }
    }, [usuarioLogado])
  );

  // Escuta os registros de horas do colaborador logado em tempo real
  useEffect(() => {
    if (!usuarioLogado?.uid) return;

    const q = query(
      collection(db, "registro_horas"),
      where("fk_usuario", "==", usuarioLogado.uid),
      where("status", "==", "ativo")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mapaProjetos: { [key: string]: CardDashboard } = {};

      snapshot.forEach((docSnap) => {
        const dados = docSnap.data();
        const projId = dados.fk_projeto;
        const projNome = dados.projeto_nome || "Projeto Sem Nome";
        const duracao = dados.duracao_total || 0;
        
        let mesAnoStr = "S/D";
        if (dados.data_lancamento) {
          const dataLanc = new Date(dados.data_lancamento.seconds * 1000);
          const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
          mesAnoStr = `${mesesNomes[dataLanc.getMonth()]}/${dataLanc.getFullYear()}`;
        }

        if (!mapaProjetos[projId]) {
          mapaProjetos[projId] = {
            projetoId: projId,
            projetoNome: projNome,
            totalHoras: 0,
            meses: []
          };
        }

        mapaProjetos[projId].totalHoras = Number((mapaProjetos[projId].totalHoras + duracao).toFixed(2));

        const listaMeses = mapaProjetos[projId].meses;
        const mesExistente = listaMeses.find(m => m.mesAno === mesAnoStr);
        if (mesExistente) {
          mesExistente.horas = Number((mesExistente.horas + duracao).toFixed(2));
        } else {
          listaMeses.push({ mesAno: mesAnoStr, horas: duracao });
        }
      });

      setDadosDash(Object.values(mapaProjetos));
      setCarregandoDash(false);
    }, (error) => {
      console.error("Erro ao carregar mini-dashboard:", error);
      setCarregandoDash(false);
    });

    return () => unsubscribe();
  }, [usuarioLogado]);

  const handleLogout = async () => {
    await logout();
  };

  const renderCardDash = ({ item }: { item: CardDashboard }) => (
    <View style={styles.dashCard}>
      <Text style={styles.dashProjectTitle}>{item.projetoNome.toUpperCase()}</Text>
      <Text style={styles.dashTotalText}>
        Horas Dedicadas: <Text style={styles.dashTotalHighlight}>{item.totalHoras}h</Text>
      </Text>
      
      <View style={styles.dashMonthsContainer}>
        {item.meses.map((m, index) => (
          <View key={index} style={styles.dashMonthRow}>
            <Text style={styles.dashMonthLabel}>• {m.mesAno}:</Text>
            <Text style={styles.dashMonthValue}>{m.horas}h</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#000060', '#3232B5', '#00007D']} style={styles.container}>
        <AppHeader
          nomeUsuario={perfil?.nome}
          onLogout={handleLogout}
          mostrarVoltar={false}
          onVoltar={() => navigation.goBack()}
        />

        {/* Seção Superior */}
        <View style={styles.topSection}>
          <Text style={styles.title}>ControlArq</Text>
          <Text style={styles.title2}>Espaço de trabalho do Colaborador</Text>
        </View>

        {/* Seção Central - Apenas o botão de Projetos centralizado */}
        <View style={styles.centerSection}>
          <Pressable style={styles.button} onPress={() => navigation.navigate("TelaProjetos")}>
            <Ionicons name="folder-open" size={22} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Acessar Projetos</Text>
          </Pressable>
        </View>

        {/* Seção Inferior - Painel de Resumo expandido ocupando melhor o espaço */}
        <View style={styles.dashboardSection}>
          <Text style={styles.dashboardSectionTitle}>MEU RESUMO DE HORAS</Text>
          
          {carregandoDash ? (
            <ActivityIndicator size="small" color="#86EBFF" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={dadosDash}
              keyExtractor={(item) => item.projetoId}
              renderItem={renderCardDash}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 15 }}
              ListEmptyComponent={
                <Text style={styles.emptyDashText}>Você ainda não realizou lançamentos de horas.</Text>
              }
            />
          )}
        </View>

        <AppCopyrigth />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: {
    alignItems: "center",
    paddingTop: 15,
    marginBottom: 5,
  },
  centerSection: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
  },
  button: {
    width: "70%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00849e",
    borderRadius: 8,
    paddingVertical: 12,
    elevation: 4,
  },
  icon: { marginRight: 8 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  title: { fontSize: 26, color: "#fff", fontWeight: "600" },
  title2: { fontSize: 15, color: "#fff", fontWeight: "400", opacity: 0.8, marginTop: 2 },
  
  // Dashboard Estilos
  dashboardSection: {
    flex: 1, // Ocupa o restante da tela com folga
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  dashboardSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#86EBFF",
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: "center"
  },
  dashCard: {
    backgroundColor: "#0017c9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  dashProjectTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4
  },
  dashTotalText: {
    fontSize: 13,
    color: "#BBBBBB"
  },
  dashTotalHighlight: {
    color: "#00FF7F",
    fontWeight: "bold"
  },
  dashMonthsContainer: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 4,
  },
  dashMonthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 3,
  },
  dashMonthLabel: {
    fontSize: 12,
    color: "#E0E0E0",
  },
  dashMonthValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#86EBFF"
  },
  emptyDashText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 25,
    fontSize: 13,
    opacity: 0.5
  },
});
