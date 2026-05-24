// TelaInicial.tsx
// Tela inicial para o aplicativo
//===============================================================

import React from "react";
import { View, Text, Button, TextInput, Image, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  TelaCriarConta: undefined;
  TelaLogin: undefined;
  TelaInicial: undefined;
};

type TelaInicialNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaInicial">;

type Props = {
  navigation: TelaInicialNavigationProp;
};

export default function TelaInicial({ navigation }: Props) {
  return (
    <LinearGradient
      colors={['#000060', '#3232B5', '#00007D']}
      style={styles.container}
    >
      <Image
        source={require('../../assets/croqui.png')}
        style={{ width: 500, height: 200, alignSelf: 'center', marginTop: 200 }}
      />

      <View style={styles.buttons}>
        <Button
          title="Projetos"
          color="#00849e"
          onPress={() => ''}
        />

        <Button
          title="Dashboards"
          color="#00849e"
          onPress={() => ''}
        />
      </View>

      <Text style={styles.footer}>
        All rights reserved. &copy;ControlARQ 2026
      </Text>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    flex: 1,
  },
  footer: {
    fontSize: 16,
    color: "#86EBFF",
    textAlign: "center",
    marginTop: 200,
  },
  buttons: {
    gap: 60,
    marginTop: 80,
    alignSelf: 'center',
    width: '40%'
  }
}); 