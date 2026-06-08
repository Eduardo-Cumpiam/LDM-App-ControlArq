// TelaInicial.tsx
// Tela Inicial do aplicativo
// Esta tela é a porta de entrada para o usuário, onde ele pode escolher entre acessar os Projetos ou os Dashboards. O design é simples e direto, com um gradiente de fundo e uma imagem centralizada para dar as boas-vindas ao usuário. Os botões são destacados para facilitar a navegação, e um rodapé discreto reforça a identidade da marca.
//======================================================================================================================

import React from "react";
import { View, Text, Button, Image, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  TelaInicial: undefined;
  TelaProjetos: undefined;
  TelaDashboards: undefined;
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
          onPress={() => navigation.navigate("TelaProjetos")}
        />

        <Button
          title="Dashboards"
          color="#00849e"
          onPress={() => navigation.navigate("TelaDashboards")}
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
    marginTop: 210,
  },
  buttons: {
    gap: 60,
    marginTop: 80,
    alignSelf: 'center',
    width: '40%'
  }
}); 