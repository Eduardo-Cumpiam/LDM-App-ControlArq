// LoginScreen.tsx
// Tela de login para o aplicativo
//===============================================================

import React from "react";
import { View, Text, Button, TextInput, Image, Pressable, StyleSheet } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from 'expo-linear-gradient';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
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
        style={{ width: 500, height: 200, alignSelf: 'center'}}    
      />

      <Text style={styles.subtitle}>
        LOGIN:
      </Text>
      <TextInput style={styles.input}
      />

      <Text style={styles.subtitle}>
        SENHA:
      </Text>
      <TextInput style={styles.input}
        secureTextEntry
      />

      <Button
        title="Criar"
        color="#00849e"
        onPress={() => ''}
      />
   
      <Pressable onPress={() => navigation.navigate("Login")}>
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