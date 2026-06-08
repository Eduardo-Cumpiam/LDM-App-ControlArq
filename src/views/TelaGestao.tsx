// TelaGestao.tsx
// Tela de Gestão para usuários com nível de acesso "Gestor"
// Esta tela segue o mesmo padrão visual das demais (gradiente de fundo, blocos com Flexbox),
// e apresenta opções de cadastro de Usuários, Clientes, Projetos e Etapas.
// ====================================================================================================================

import React from "react";
import { Text, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  TelaGestao: undefined;
  TelaCadastroUsuarios: undefined;
  TelaCadastroClientes: undefined;
  TelaCadastroProjetos: undefined;
  TelaCadastroEtapas: undefined;
};

type TelaGestaoNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaGestao">;

type Props = {
  navigation: TelaGestaoNavigationProp;
};

export default function TelaGestao({ navigation }: Props) {
  return (
    <LinearGradient
      colors={["#000060", "#3232B5", "#00007D"]}
      style={styles.container}
    >
      <View style={styles.contentWrapper}>

        {/* BLOCO SUPERIOR: Título */}
        <View style={styles.topSection}>
          <Text style={styles.title}>Módulo de Gestão</Text>
          <Text style={styles.subtitle}>Cadastros principais do sistema</Text>
        </View>

        {/* BLOCO CENTRAL: Botões de Gestão */}
        <View style={styles.centerSection}>
          <Pressable style={styles.button} onPress={() => navigation.navigate("TelaCadastroUsuarios")}>
            <Text style={styles.buttonText}>USUÁRIOS</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => navigation.navigate("TelaCadastroClientes")}>
            <Text style={styles.buttonText}>CLIENTES</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => navigation.navigate("TelaCadastroProjetos")}>
            <Text style={styles.buttonText}>PROJETOS</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => navigation.navigate("TelaCadastroEtapas")}>
            <Text style={styles.buttonText}>ETAPAS</Text>
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
  container: {
    flex: 1,
  },
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
    fontSize: 26,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#86EBFF",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#00849e",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginVertical: 10,
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
