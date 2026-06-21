// App.tsx
// Arquivo principal do aplicativo
// Para rodar o aplicativo, use o comando: npm start ou npx expo start
//===============================================================

import React, { useEffect, useState } from "react";
import { Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import AppNavigator from "./src/navigation/AppNavigator";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const preparar = async () => {
      // Simula carregamento inicial (fonts, dados, autenticação, etc.)
      await new Promise(resolve => setTimeout(resolve, 5000));
      setReady(true);
      SplashScreen.hideAsync();
    };
    preparar();
  }, []);

  if (!ready) {
    return (
      <LinearGradient
        colors={["#000060", "#3232B5", "#00007D"]}
        style={styles.container}
      >
        <Image source={require("./assets/logo.png")} style={styles.logo} />
      </LinearGradient>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain"
  }
});
