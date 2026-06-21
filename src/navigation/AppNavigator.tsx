// src/navegacao/AppNavigator.tsx
// Navegação principal integrada com AuthContext
// Regras de negócio:
// - Se não autenticado → TelaLogin
// - Se autenticado e status ≠ autorizado → TelaLogin (bloqueio)
// - Se autenticado e status = autorizado e perfil = Gestor → TelaGestorInicial
// - Se autenticado e status = autorizado e perfil ≠ Gestor → TelaInicial
// ====================================================================================================================

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

// Telas
import TelaLogin from "../views/TelaLogin";
import TelaCriarConta from "../views/TelaCriarConta";
import TelaGestorInicial from "../views/TelaGestorInicial";
import TelaGestao from "../views/TelaGestao";
import TelaInicial from "../views/TelaInicial";
import TelaProjetos from "../views/TelaProjetos";
import TelaDashboards from "../views/TelaDashboards";
import TelaCadastroUsuarios from "../views/TelaCadastroUsuarios";
import TelaCadastroClientes from "../views/TelaCadastroClientes";
import TelaCadastroProjetos from "../views/TelaCadastroProjetos";
import TelaCadastroEtapas from "../views/TelaCadastroEtapas";
import TelaGestaoEtapas from "../views/TelaGestaoEtapas";
import TelaLancamentoHoras from "../views/TelaLancamentoHoras";
import TelaLancamentoFinancas from "../views/TelaLancamentoFinancas"; // ✅ Importada a nova tela financeira

// Contexto
import { AuthProvider, useAuth } from "../context/AuthContext";

// Tipagem das rotas
export type RootStackParamList = {
  TelaLogin: undefined;
  TelaCriarConta: undefined;
  TelaGestorInicial: undefined;
  TelaGestao: undefined;
  TelaCadastroUsuarios: undefined;
  TelaCadastroClientes: undefined;
  TelaCadastroProjetos: undefined;
  TelaCadastroEtapas: undefined;
  TelaGestaoEtapas: undefined;
  TelaProjetos: undefined;
  TelaLancamentoHoras: { projetoId: string; projetoNome: string };
  TelaLancamentoFinancas: undefined; // ✅ Adicionada a nova rota de finanças na tipagem
  TelaDashboards: undefined;
  TelaInicial: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigatorInterno() {
  const { usuarioLogado, perfil } = useAuth();

  // Não logado → TelaLogin + TelaCriarConta
  if (!usuarioLogado) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="TelaLogin"
          component={TelaLogin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TelaCriarConta"
          component={TelaCriarConta}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  // Logado mas não autorizado → mantém na TelaLogin
  if (perfil?.status !== "autorizado") {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="TelaLogin"
          component={TelaLogin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TelaCriarConta"
          component={TelaCriarConta}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  // Autorizado e gestor → stack do gestor
  if (perfil?.nivel_acesso === "gestor") {
    return (
      <Stack.Navigator
        screenOptions={{
          headerTintColor: "#00849e",
          headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
        }}
      >
        <Stack.Screen
          name="TelaGestorInicial"
          component={TelaGestorInicial}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TelaGestao"
          component={TelaGestao}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TelaCadastroUsuarios"
          component={TelaCadastroUsuarios}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TelaCadastroClientes"
          component={TelaCadastroClientes}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TelaCadastroProjetos"
          component={TelaCadastroProjetos}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TelaCadastroEtapas"
          component={TelaCadastroEtapas}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TelaGestaoEtapas"
          component={TelaGestaoEtapas}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TelaProjetos"
          component={TelaProjetos}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TelaLancamentoHoras"
          component={TelaLancamentoHoras}
          options={{
            headerShown: false,
          }}
        />
        {/* ✅ Nova Screen inserida de forma restrita apenas no bloco do Gestor */}
        <Stack.Screen
          name="TelaLancamentoFinancas"
          component={TelaLancamentoFinancas}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TelaDashboards"
          component={TelaDashboards}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    );
  }

  // Autorizado e não gestor → stack comum
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold", fontSize: 25 },
        headerBackground: () => (
          <LinearGradient colors={["#00009B", "#1C6CBD", "#000060"]} />
        ),
      }}
    >
      <Stack.Screen
        name="TelaInicial"
        component={TelaInicial}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TelaProjetos"
        component={TelaProjetos}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TelaDashboards"
        component={TelaDashboards}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TelaLancamentoHoras"
        component={TelaLancamentoHoras}
        options={{
          headerShown: false,
        }}
      />
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
