// src/navegacao/AppNavigator.tsx
// Navegação principal integrada com AuthContext
// Regras de negócio:
// - Se não autenticado → TelaLogin
// - Se autenticado e perfil = Gestor → TelaGestorInicial
// - Se autenticado e perfil ≠ Gestor → TelaInicial
// ====================================================================================================================

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Importação das Telas
import TelaLogin from "../views/TelaLogin";
import TelaGestorInicial from "../views/TelaGestorInicial";
import TelaGestao from "../views/TelaGestao";
import TelaInicial from "../views/TelaInicial";
import TelaProjetos from "../views/TelaProjetos";
import TelaDashboards from "../views/TelaDashboards";
import TelaCadastroUsuarios from "../views/TelaCadastroUsuarios";
import TelaCadastroClientes from "../views/TelaCadastroClientes";
import TelaCadastroProjetos from "../views/TelaCadastroProjetos";
import TelaCadastroEtapas from "../views/TelaCadastroEtapas";

// Contexto de Autenticação
import { AuthProvider, useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

function NavigatorInterno() {
  const { usuarioLogado, perfil, logout } = useAuth();

  // Tratamento preventivo para ler o nível de acesso independente de letras maiúsculas/minúsculas
  const nivelAcesso = perfil?.nivel_acesso?.toLowerCase() || "";

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerTintColor: "#00849e",
        headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
        headerLeft: () => (
          <Ionicons
            name="arrow-back"
            size={24}
            color="#00849e"
            style={{ marginLeft: 10 }}
            onPress={() => navigation.goBack()}
          />
        ),
      })}
    >
      {!usuarioLogado ? (
        // 1. Caso: Usuário não logado → TelaLogin
        <Stack.Screen
          name="TelaLogin"
          component={TelaLogin}
          options={{
            headerShown: false,
          }}
        />
      ) : nivelAcesso === "gestor" ? (
        // 2. Caso: Usuário logado e gestor → Telas Administrativas
        <>
          <Stack.Screen
            name="TelaGestorInicial"
            component={TelaGestorInicial}
            options={() => ({
              title: "Área do Gestor",
              headerRight: () => (
                <Ionicons
                  name="log-out-outline"
                  size={24}
                  color="#00849e"
                  style={{ marginRight: 10 }}
                  onPress={() => logout()}
                />
              ),
            })}
          />
          
          {/* Telas exclusivas e cadastros do Gestor */}
          <Stack.Screen name="TelaGestao" component={TelaGestao} options={{ title: "Gestão" }} />
          <Stack.Screen name="TelaCadastroUsuarios" component={TelaCadastroUsuarios} options={{ title: "Cadastrar Usuário" }} />
          <Stack.Screen name="TelaCadastroClientes" component={TelaCadastroClientes} options={{ title: "Cadastrar Cliente" }} />
          <Stack.Screen name="TelaCadastroProjetos" component={TelaCadastroProjetos} options={{ title: "Cadastrar Projeto" }} />
          <Stack.Screen name="TelaCadastroEtapas" component={TelaCadastroEtapas} options={{ title: "Etapas do Projeto" }} />

          {/* Telas comuns acessíveis também ao gestor */}
          <Stack.Screen name="TelaProjetos" component={TelaProjetos} options={{ title: "Projetos" }} />
          <Stack.Screen name="TelaDashboards" component={TelaDashboards} options={{ title: "Dashboards" }} />
        </>
      ) : (
        // 3. Caso: Usuário logado e Colaborador/Supervisor → Telas Comuns
        <>
          <Stack.Screen
            name="TelaInicial"
            component={TelaInicial}
            options={{
              title: "Control ARQ",
              headerShown: true, // Ativado para exibir o botão de voltar e o topo estilizado
              headerBackground: () => (
                <LinearGradient colors={["#00009B", "#1C6CBD", "#000060"]} style={{ flex: 1 }} />
              ),
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold", fontSize: 25 },
              headerRight: () => (
                <Ionicons
                  name="log-out-outline"
                  size={24}
                  color="#fff"
                  style={{ marginRight: 10 }}
                  onPress={() => logout()}
                />
              ),
            }}
          />

          {/* Telas comuns acessíveis aos colaboradores */}
          <Stack.Screen name="TelaProjetos" component={TelaProjetos} options={{ title: "Projetos" }} />
          <Stack.Screen name="TelaDashboards" component={TelaDashboards} options={{ title: "Dashboards" }} />
          <Stack.Screen name="TelaCadastroEtapas" component={TelaCadastroEtapas} options={{ title: "Lançar Horas" }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <NavigatorInterno />
      </NavigationContainer>
    </AuthProvider>
  );
}