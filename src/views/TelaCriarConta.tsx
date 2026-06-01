// Tela de Criação de Conta Estática e Responsiva com Flexbox (Sem Scroll)

import React, { useState } from "react";
import { Text, Button, TextInput, Image, Pressable, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  TelaCriarConta: undefined;
  TelaLogin: undefined;
};

type TelaCriarContaNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaCriarConta">;

type Props = {
  navigation: TelaCriarContaNavigationProp;
};

export default function TelaCriarConta({ navigation }: Props) {
  // Estados para capturar os dados quando formos amarrar o cadastro
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <LinearGradient
      colors={['#000060', '#3232B5', '#00007D']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.contentWrapper}
        >

          {/* BLOCO SUPERIOR: Título e Imagem */}
          <View style={styles.topSection}>
            <Text style={styles.title}>
              Crie a sua conta para desfrutar das melhores possibilidades de gerenciamento.
            </Text>
            <Image
              source={require('../../assets/croqui.png')}
              style={styles.imageCroqui}
              resizeMode="contain"
            />
          </View>

          {/* BLOCO CENTRAL: Formulário de Cadastro */}
          <View style={styles.formSection}>
            <Text style={styles.subtitle}>LOGIN:</Text>
            <TextInput 
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="seu-email@provedor.com"
              placeholderTextColor="#999"
            />

            <Text style={styles.subtitle}>SENHA:</Text>
            <TextInput 
              style={styles.input}
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
              autoCapitalize="none"
              placeholder="******"
              placeholderTextColor="#999"
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Criar"
                color="#00849e"
                onPress={() => {
                  // Aqui depois chamaremos a função de cadastro
                }}
              />
            </View>
          </View>

          {/* BLOCO INFERIOR: Links e Rodapé */}
          <View style={styles.footerSection}>
            <Pressable onPress={() => navigation.replace("TelaLogin")}>
              <Text style={styles.footerLink}>
                já criou sua conta? faça seu login
              </Text>
            </Pressable>

            <Text style={styles.copyright}>
              All rights reserved. &copy;ControlARQ 2026
            </Text>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "space-between", // Distribui os blocos proporcionalmente
    paddingVertical: 20,
  },
  topSection: {
    alignItems: "center",
    flex: 1.3, // Um pouquinho mais de espaço para o texto maior de criação de conta
    justifyContent: "center",
  },
  formSection: {
    width: "100%",
    justifyContent: "center",
    flex: 1.5,
  },
  footerSection: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20, // Ajustado de 30 para 20 porque esse texto é mais longo e ocupava muita tela
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "600",
  },
  imageCroqui: {
    width: "85%",
    height: "45%",
    maxHeight: 130,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    height: 44,
    borderColor: '#fff',
    borderWidth: 2,
    marginBottom: 15,
    color: "#fff",
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  buttonContainer: {
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 10,
  },
  footerLink: {
    fontSize: 15,
    color: "#86EBFF",
    textAlign: "center",
    marginBottom: 15,
    textDecorationLine: "underline",
  },
  copyright: {
    fontSize: 11,
    color: "#86EBFF",
    textAlign: "center",
    opacity: 0.6,
  }
});