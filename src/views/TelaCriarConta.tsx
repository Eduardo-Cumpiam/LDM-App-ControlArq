// TelaCriarConta.tsx
// Tela de Criação de Conta para o aplicativo
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

type TelaCriarContaNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaCriarConta">;

type Props = {
  navigation: TelaCriarContaNavigationProp;
};

export default function TelaCriarConta({ navigation }: Props) {
  return (
    <LinearGradient
      colors={['#000060', '#3232B5', '#00007D']}
      style={styles.container}
    >

      <Text style={styles.title}>
        Crie a sua conta para desfrutar das melhores possibilidades de gerenciamento.
      </Text>

      <Image
        source={require('../../assets/croqui.png')}
        style={{ width: 500, height: 200, alignSelf: 'center' }}
      />

      <Text style={styles.subtitle}>
        LOGIN:
      </Text>
      <TextInput style={styles.input} />

      <Text style={styles.subtitle}>
        SENHA:
      </Text>
      <TextInput style={styles.input} secureTextEntry />

      <Button
        title="Criar"
        color="#00849e"
        onPress={() => ''}
      />

      <Pressable onPress={() => navigation.replace("TelaLogin")}>
        <Text style={styles.footer}>
          já criou sua conta? faça seu login
        </Text>
      </Pressable>

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
  title: {
    fontSize: 30,
    color: "#fff",
    textAlign: "center",
    marginTop: 90,
  },
  subtitle: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 10,
    marginTop: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: '#fff',
    borderWidth: 2,
    marginBottom: 20,
    color: "#fff",
    borderRadius: 5,
  },
  footer: {
    fontSize: 16,
    color: "#86EBFF",
    textAlign: "center",
    marginTop: 30,
  },
}); 