// src/navegacao/AppNavigator.tsx
// Navegação principal integrada com AuthContext
// Regras de negócio:
// - Se não autenticado → TelaLogin
// - Se autenticado e perfil = Gestor → TelaGestorInicial
// - Se autenticado e perfil ≠ Gestor → TelaInicial
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
        // Usuário não logado → TelaLogin
        <Stack.Screen
          name="TelaLogin"
          component={TelaLogin}
          options={{
            //title: "Control ARQ",
            headerShown: false,
            //headerTintColor: "#fff",
            //headerTitleStyle: { fontWeight: "bold", fontSize: 25 },
            //headerBackground: () => (
             // <LinearGradient colors={["#00009B", "#1C6CBD", "#000060"]} />
           // ),
           // headerRight: () => (
           //   <Ionicons
           //     name="business"
           //     size={30}
           //     color="#ffffff"
           //     style={{ marginRight: 195 }}
           //   />
           // ),
          }}
        />
      ) : perfil?.nivel_acesso === "gestor" ? (
        // Usuário logado e gestor → TelaGestorInicial
        <>
          <Stack.Screen
            name="TelaGestorInicial"
            component={TelaGestorInicial}
            options={({ navigation }) => ({
              title: "Área do Gestor",
              headerRight: () => (
                <Ionicons
                  name="log-out-outline"
                  size={24}
                  color="#00849e"
                  style={{ marginRight: 10 }}
                  onPress={() => {
                    // chama logout do AuthContext
                    logout();
                  
                        //title: "Control ARQ",
              //headerShown: false,
              //headerTintColor: "#fff",
              //headerTitleStyle: { fontWeight: "bold", fontSize: 25 },
              //headerBackground: () => (
              //  <LinearGradient colors={["#00009B", "#1C6CBD", "#000060"]} />
              //),
              //headerRight: () => (
              //  <Ionicons
              //    name="business"
              //    size={30}
              //    color="#fff"
              //    style={{ marginRight: 140 }}
              //  />
              //),
            }}
          />
           ),
         })}
        />
        
          {/* Tela de Gestão e cadastros acessíveis apenas ao gestor */}
          <Stack.Screen name="TelaGestao" component={TelaGestao} />
          <Stack.Screen name="TelaCadastroUsuarios" component={TelaCadastroUsuarios} />
          <Stack.Screen name="TelaCadastroClientes" component={TelaCadastroClientes} />
          <Stack.Screen name="TelaCadastroProjetos" component={TelaCadastroProjetos} />
          <Stack.Screen name="TelaCadastroEtapas" component={TelaCadastroEtapas} />

          {/* Telas comuns também acessíveis ao gestor */}
          <Stack.Screen name="TelaProjetos" component={TelaProjetos} />
          <Stack.Screen name="TelaDashboards" component={TelaDashboards} />
        </>
      ) : (
        // Usuário logado e não gestor → TelaInicial
        <>
          <Stack.Screen
            name="TelaInicial"
            component={TelaInicial}
            options={{
              title: "Control ARQ",
              headerShown: false,
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold", fontSize: 25 },
              headerBackground: () => (
                <LinearGradient colors={["#00009B", "#1C6CBD", "#000060"]} />
              ),
              headerRight: () => (
                <Ionicons
                  name="business"
                  size={30}
                  color="#fff"
                  style={{ marginRight: 140 }}
                />
              ),
            }}
          />

          {/* Telas comuns a todos os usuários */}
          <Stack.Screen name="TelaProjetos" component={TelaProjetos} />
          <Stack.Screen name="TelaDashboards" component={TelaDashboards} />
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
