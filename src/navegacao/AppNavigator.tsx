// AppNavigator.tsx
// Arquivo para definir a navegação principal do aplicativo
//===============================================================

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import TelaCriarConta from "../views/TelaCriarConta";
import TelaLogin from "../views/TelaLogin";
import TelaInicial from "../views/TelaInicial";
import TelaProjetos from "../views/TelaProjetos";
import TelaDashboards from "../views/TelaDashboards";


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen
          name="TelaCriarConta"
          component={TelaCriarConta}
          options={{
            title: "Control ARQ",

            headerTintColor: "#fff",

            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 25,
            },

            headerBackground: () => (
              <LinearGradient
                colors={['#00009B', '#1C6CBD', '#000060']}
              />
            ),
            headerRight: () => (
              <Ionicons
                name="business"
                size={30}
                color="#ffffff"
                style={{ marginRight: 195 }}
              />
            ),
          }}
        />
        <Stack.Screen
          name="TelaLogin"
          component={TelaLogin}
          options={{
            title: "Control ARQ",

            headerTintColor: "#fff",

            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 25,
            },

            headerBackground: () => (
              <LinearGradient
                colors={['#00009B', '#1C6CBD', '#000060']}
              />
            ),
            headerRight: () => (
              <Ionicons
                name="business"
                size={30}
                color="#ffffff"
                style={{ marginRight: 195 }}
              />
            ),
          }}
        />
        <Stack.Screen
          name="TelaInicial"
          component={TelaInicial}
          options={{
            title: "Control ARQ",

            headerTintColor: "#fff",

            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 25,
            },

            headerBackground: () => (
              <LinearGradient
                colors={['#00009B', '#1C6CBD', '#000060']}
              />
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
        <Stack.Screen
          name="TelaProjetos"
          component={TelaProjetos}
          options={{
            title: "Control ARQ",

            headerTintColor: "#fff",

            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 25,
            },

            headerBackground: () => (
              <LinearGradient
                colors={['#00009B', '#1C6CBD', '#000060']}
              />
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
        <Stack.Screen
          name="TelaDashboards"
          component={TelaDashboards}
          options={{
            title: "Control ARQ",

            headerTintColor: "#fff",

            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 25,
            },

            headerBackground: () => (
              <LinearGradient
                colors={['#00009B', '#1C6CBD', '#000060']}
              />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}