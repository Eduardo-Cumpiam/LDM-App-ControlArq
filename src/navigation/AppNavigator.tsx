// AppNavigator.tsx
// Arquivo para definir a navegação principal do aplicativo
//===============================================================

import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../views/TelaLogin";
import HomeScreen from "../views/TelaInicial";
import TelaLogin from "../views/TelaLogin";
import TelaInicial from "../views/TelaInicial";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={TelaLogin} />
        <Stack.Screen name="Home" component={TelaInicial} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
