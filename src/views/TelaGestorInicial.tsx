// TelaGestorInicial.tsx
// Tela inicial exclusiva para gestores, com caminhos para Gestão, Finanças, Lançamentos e Resultados.
// ====================================================================================================================

import React, { useCallback } from "react";
import { Text, Pressable, StyleSheet, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import AppCopyrigth from "../components/AppCopyrigth";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";
import { useBackHandlerLogout } from "../hooks/useBackHandlerLogout";
import { RootStackParamList } from "../navigation/AppNavigator";

type TelaGestorNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TelaGestorInicial"
>;

type Props = {
  navigation: TelaGestorNavigationProp;
};

export default function TelaGestorInicial({ navigation }: Props) {
  const { usuarioLogado, perfil, logout } = useAuth();

  // ✅ Hook para logout ao pressionar o botão de voltar físico do Android
  useBackHandlerLogout();

  useFocusEffect(
    useCallback(() => {
      if (!usuarioLogado) {
        console.log("Usuário não está logado");
      }
    }, [usuarioLogado]),
  );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000060", "#3232B5", "#00007D"]}
        style={styles.container}
      >
        <AppHeader
          nomeUsuario={perfil?.nome}
          onLogout={handleLogout}
          mostrarVoltar={false}
        />

        <View style={styles.contentWrapper}>
          {/* BLOCO SUPERIOR: Cabeçalho */}
          <View style={styles.topSection}>
            <Text style={styles.title}>Painel do Gestor</Text>
            <Text style={styles.subtitle}>Gestão e Controle de Projetos</Text>

            <Image
              source={require("../../assets/croqui4.png")}
              style={styles.imageCroqui}
              resizeMode="contain"
            />
          </View>

          {/* BLOCO CENTRAL: Botões principais */}
          <View style={styles.centerSection}>
            {/* Leva para a área administrativa de cadastros */}
            <Pressable
              style={styles.buttonGestao}
              onPress={() => navigation.navigate("TelaGestao")}
            >
              <Ionicons
                name="settings"
                size={22}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Painel de Gestão</Text>
            </Pressable>

            {/* ✅ NOVO: Leva para o lançamento de despesas, impostos e faturamento */}
            <Pressable
              style={styles.buttonFinanceiro}
              onPress={() => navigation.navigate("TelaLancamentoFinancas")}
            >
              <Ionicons
                name="cash"
                size={22}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Lançamentos Financeiros</Text>
            </Pressable>

            {/* Leva para a listagem onde o gestor também pode ver detalhes completos e lançar suas horas */}
            <Pressable
              style={styles.button}
              onPress={() => navigation.navigate("TelaProjetos")}
            >
              <Ionicons
                name="folder-open"
                size={22}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Projetos & Horas</Text>
            </Pressable>

            {/* Leva para a visualização analítica global de resultados */}
            <Pressable
              style={styles.button}
              onPress={() => navigation.navigate("TelaDashboards")}
            >
              <Ionicons
                name="pie-chart"
                size={22}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Resultados & Métricas</Text>
            </Pressable>
          </View>
        </View>

        <AppCopyrigth />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  topSection: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  centerSection: {
    flex: 2.2,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    color: "#FFF",
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#86EBFF",
    fontWeight: "500",
    marginBottom: 15,
  },
  button: {
    width: "85%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00849e",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 6,
    elevation: 4,
  },
  buttonGestao: {
    width: "85%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF8C00",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 6,
    elevation: 4,
  },
  buttonFinanceiro: {
    width: "85%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 6,
    elevation: 4,
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  imageCroqui: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    opacity: 0.6,
  },
});
