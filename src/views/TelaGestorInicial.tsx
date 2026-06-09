// TelaGestorInicial.tsx
// Tela inicial exclusiva para gestores, com ícones e cabeçalho destacado.
// Esta tela mantém o mesmo padrão visual das demais (gradiente de fundo, divisão em blocos com Flexbox),
// mas adiciona uma opção extra de "Gestão", que leva para o módulo de cadastros (usuários, clientes, projetos, etapas).
// ====================================================================================================================

import React from "react";
import { Text, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

type RootStackParamList = {
  TelaGestorInicial: undefined;
  TelaGestao: undefined;
  TelaProjetos: undefined;
  TelaDashboards: undefined;
};

type TelaGestorNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaGestorInicial">;

type Props = {
  navigation: TelaGestorNavigationProp;
};

export default function TelaGestorInicial({ navigation }: Props) {
  return (
    <LinearGradient
      colors={["#000060", "#3232B5", "#00007D"]}
      style={styles.container}
    >
      <View style={styles.contentWrapper}>

        {/* BLOCO SUPERIOR: Cabeçalho */}
        <View style={styles.topSection}>
          <Text style={styles.title}>Área do Gestor</Text>
          <Text style={styles.subtitle}>Gestão e Controle de Projetos</Text>
        </View>

        {/* BLOCO CENTRAL: Botões principais */}
        <View style={styles.centerSection}>
          <Pressable style={styles.button} onPress={() => navigation.navigate("TelaProjetos")}>
            <Ionicons name="folder-open" size={22} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Projetos</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => navigation.navigate("TelaDashboards")}>
            <Ionicons name="stats-chart" size={22} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Dashboards</Text>
          </Pressable>

          <Pressable style={styles.buttonGestao} onPress={() => navigation.navigate("TelaGestao")}>
            <Ionicons name="settings" size={22} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Gestão</Text>
          </Pressable>
        </View>

        {/* BLOCO INFERIOR: Rodapé */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            All rights reserved. ©ControlARQ 2026
          </Text>
        </View>

      </View>
    </LinearGradient>
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
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  footerSection: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    color: "#FF8C00", // cor diferenciada para destacar "Área do Gestor"
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#86EBFF",
    fontWeight: "500",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00849e",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginVertical: 10,
  },
  buttonGestao: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF8C00", // cor diferenciada para gestão
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  footerText: {
    fontSize: 11,
    color: "#86EBFF",
    textAlign: "center",
    opacity: 0.6,
  },
});
