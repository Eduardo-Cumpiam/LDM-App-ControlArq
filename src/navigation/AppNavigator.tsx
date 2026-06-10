// src/navegacao/AppNavigator.tsx
// Navegação principal integrada com AuthContext
// Regras de negócio:
// - Se não autenticado → TelaLogin
// - Se autenticado e status ≠ autorizado → TelaLogin (bloqueio)
// - Se autenticado e status = autorizado e perfil = Gestor → TelaGestorInicial
// - Se autenticado e status = autorizado e perfil ≠ Gestor → TelaInicial
// ====================================================================================================================

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

  // Usuário não logado → TelaLogin
  if (!usuarioLogado) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="TelaLogin"
          component={TelaLogin}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  // Usuário logado mas não autorizado → mantém na TelaLogin
  if (perfil?.status !== "autorizado") {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="TelaLogin"
          component={TelaLogin}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  // Usuário autorizado e gestor → stack do gestor
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
            title: "Área do Gestor",
            headerRight: () => (
              <Ionicons
                name="log-out-outline"
                size={24}
                color="#00849e"
                style={{ marginRight: 10 }}
                onPress={logout}
              />
            ),
          }}
        />
        {/* Telas exclusivas do gestor */}
        <Stack.Screen name="TelaGestao" component={TelaGestao} />
        <Stack.Screen name="TelaCadastroUsuarios" component={TelaCadastroUsuarios} />
        <Stack.Screen name="TelaCadastroClientes" component={TelaCadastroClientes} />
        <Stack.Screen name="TelaCadastroProjetos" component={TelaCadastroProjetos} />
        <Stack.Screen name="TelaCadastroEtapas" component={TelaCadastroEtapas} />

        {/* Telas comuns também acessíveis ao gestor */}
        <Stack.Screen name="TelaProjetos" component={TelaProjetos} />
        <Stack.Screen name="TelaDashboards" component={TelaDashboards} />
      </Stack.Navigator>
    );
  }

  // Usuário autorizado e não gestor → stack comum
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
      {/* Telas comuns a todos os usuários */}
      <Stack.Screen name="TelaProjetos" component={TelaProjetos} />
      <Stack.Screen name="TelaDashboards" component={TelaDashboards} />
      <Stack.Screen name="TelaCadastroEtapas" component={TelaCadastroEtapas} />
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
