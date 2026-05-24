// AppNavigator.tsx
// Arquivo para definir a navegação principal do aplicativo
//===============================================================

import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import TelaCriarConta from "../views/TelaCriarConta";
import TelaLogin from "../views/TelaLogin"

const Stack = createStackNavigator();

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
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              />
            ),
            headerRight: () => (
              <Ionicons
                name="business"
                size={30}
                color="#ffffff"
                style={{ marginRight: 210 }}
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
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              />
            ),
            headerRight: () => (
              <Ionicons
                name="business"
                size={30}
                color="#ffffff"
                style={{ marginRight: 210 }}
              />
            ),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}