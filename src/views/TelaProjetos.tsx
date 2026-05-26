// TelaProjetos.tsx
// Tela de Projetos para o aplicativo
//===============================================================

import React from "react";
import { View, Text, Button, TextInput, Image, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  TelaProjetos: undefined;
};

type TelaProjetosNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaProjetos">;

type Props = {
  navigation: TelaProjetosNavigationProp;
};

export default function TelaProjetos({ navigation }: Props) {
  return (
    <LinearGradient
      colors={['#000060', '#3232B5', '#00007D']}
      style={styles.container}
    >  
      <View style={styles.card}>
        <Image
          source={{
            uri: 'https://picsum.photos/300/200'
          }}
          style={styles.image}
        />
        <View style={styles.content}>
          <Text style={styles.title}>Tempo Estimado: <Text style={styles.tempo_estimado}>1200h</Text> </Text>
          <Text style={styles.title}>Orçamento Estimado: <Text style={styles.orçamento_estimado}>R$50.000,00</Text> </Text>

          <Text style={styles.title}>Tempo Gasto: <Text style={styles.tempo_gasto}>175h</Text></Text>
          <Text style={styles.title}>Orçamento Gasto: <Text style={styles.orçamento_gasto}>R$7.500,00</Text> </Text>

          <Text style={styles.descricao}>
            Esse é um exemplo simples de card bonito usando apenas React Native.
          </Text>

          <View style={styles.button}>
            <Text style={styles.buttonText}>TRABALHAR NESTE PROJETO</Text>
          </View>
        </View>
      </View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    flex: 1,
  },
  card: {
    width: 320,
    marginTop: 70,
    backgroundColor: '#0017c9',
    borderRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    alignSelf: 'center',

  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  tempo_estimado: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00990d',
    marginBottom: 10,
  },
  orçamento_estimado: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00990d',
    marginBottom: 10,
  },
  tempo_gasto: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#b30000',
    marginBottom: 10,
  },
  orçamento_gasto: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#b30000',
    marginBottom: 10,
  },
  descricao: {
    fontSize: 15,
    color: '#BBBBBB',
    lineHeight: 22,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00aeff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 