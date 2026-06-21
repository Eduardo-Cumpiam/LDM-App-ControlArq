// TelaGestao.tsx
// Tela de Gestão para usuários com nível de acesso "Gestor"
// Esta tela segue o mesmo padrão visual das demais (gradiente de fundo, blocos com Flexbox),
// e apresenta opções de cadastro de Usuários, Clientes, Projetos e Etapas.
// ====================================================================================================================

import React, { useCallback } from "react";
import { Text, Pressable, StyleSheet, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import AppCopyrigth from "../components/AppCopyrigth";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";
import { useBackHandlerLogout } from "../hooks/useBackHandlerLogout";
import { RootStackParamList } from "../navigation/AppNavigator";

type TelaGestaoNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaGestao">;

type Props = {
  navigation: TelaGestaoNavigationProp;
};

export default function TelaGestao({ navigation }: Props) {

  const { usuarioLogado, perfil, logout } = useAuth();

  // ✅ Hook para logout ao pressionar o botão de voltar
  useBackHandlerLogout();

  // ✅ Verifica se o usuário ainda está logado quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      if (!usuarioLogado) {
        // O NavigatorInterno vai renderizar o stack de login automaticamente
        console.log('Usuário não está logado');
      }
    }, [usuarioLogado])
  );

  const handleLogout = async () => {
    await logout();
    // ⚠️ NÃO navegue para TelaLogin
    // O NavigatorInterno vai renderizar o stack de login automaticamente
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
          mostrarVoltar={true}
          onVoltar={() => {
            navigation.navigate("TelaGestorInicial");
          }}
        />

        <View style={styles.contentWrapper}>
          {/* BLOCO SUPERIOR: Cabeçalho */}
          <View style={styles.topSection}>
            <Text style={styles.title}>Módulo de Gestão</Text>
            <Text style={styles.subtitle}>Área exclusiva do Gestor</Text>

            <Image
              source={require("../../assets/croqui4.png")}
              style={styles.imageCroqui}
              resizeMode="contain"
            />
          </View>

          {/* BLOCO CENTRAL: Botões de Gestão */}
          <View style={styles.centerSection}>
            <Pressable style={styles.button} onPress={() => navigation.navigate("TelaCadastroUsuarios")}>
              <Ionicons name="people" size={22} color="#fff" style={styles.icon} />
              <Text style={styles.buttonText}>Usuários</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={() => navigation.navigate("TelaCadastroClientes")}>
              <Ionicons name="person-circle" size={22} color="#fff" style={styles.icon} />
              <Text style={styles.buttonText}>Clientes</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={() => navigation.navigate("TelaCadastroEtapas")}>
              <Ionicons name="construct" size={22} color="#fff" style={styles.icon} />
              <Text style={styles.buttonText}>Etapas</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={() => navigation.navigate("TelaGestaoEtapas")}>
              <Ionicons name="layers" size={22} color="#fff" style={styles.icon} />
              <Text style={styles.buttonText}>Gerenciar Etapas</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={() => navigation.navigate("TelaCadastroProjetos")}>
              <Ionicons name="folder-open" size={22} color="#fff" style={styles.icon} />
              <Text style={styles.buttonText}>Projetos</Text>
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
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    color: "#FF8C00",
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#86EBFF",
    fontWeight: "500",
  },
  button: {
    width: "60%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00849e",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  imageCroqui: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
