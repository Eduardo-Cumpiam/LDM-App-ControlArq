// TelaCriarConta.tsx
// Tela de Criação de Conta alinhada ao fluxo de cadastro inicial sempre pendente.
// Utiliza o AuthContext para registrar o usuário no Firebase Auth e salvar o perfil no Firestore.
// Esta tela é a primeira que o usuário vê ao abrir o aplicativo pela primeira vez
// Ela é projetada para ser simples, intuitiva e responsiva, utilizando Flexbox para garantir que os elementos se ajustem bem em diferentes tamanhos de tela
//=====================================================================================================================

import React, { useState } from "react";
import {
  Text,
  Button,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { useAuth } from "../context/AuthContext";

type RootStackParamList = {
  TelaCriarConta: undefined;
  TelaLogin: undefined;
};

type TelaCriarContaNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TelaCriarConta"
>;

type Props = {
  navigation: TelaCriarContaNavigationProp;
};

export default function TelaCriarConta({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [nome, setNome] = useState("");

  const { cadastrarNovoFuncionario } = useAuth();

  const handleCriarConta = async () => {
    if (!email || !senha || !nome) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    try {
      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        senha
      );
      const user = userCredential.user;

      // Salva perfil no Firestore com status pendente
      await cadastrarNovoFuncionario(
        user.uid,
        nome,
        email.trim(),
        "colaborador", // padrão inicial
        "Júnior",      // padrão inicial
        0              // valor hora inicial
      );

      Alert.alert(
        "Conta criada",
        "Seu cadastro foi realizado e está pendente de autorização do gestor."
      );
      navigation.replace("TelaLogin");
    } catch (error: any) {
      Alert.alert("Erro ao criar conta", error.message);
    }
  };

  return (
    <LinearGradient
      colors={["#000060", "#3232B5", "#00007D"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.contentWrapper}
        >
          {/* BLOCO SUPERIOR */}
          <View style={styles.topSection}>
            <Text style={styles.title}>
              Crie a sua conta para desfrutar das melhores possibilidades de gerenciamento.
            </Text>
            <Image
              source={require("../../assets/croqui.png")}
              style={styles.imageCroqui}
              resizeMode="contain"
            />
          </View>

          {/* BLOCO CENTRAL */}
          <View style={styles.formSection}>
            <Text style={styles.subtitle}>NOME:</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome completo"
              placeholderTextColor="#999"
            />

            <Text style={styles.subtitle}>E-MAIL:</Text>
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
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!senhaVisivel}
                value={senha}
                onChangeText={setSenha}
                autoCapitalize="none"
                placeholder="Digite sua senha"
                placeholderTextColor="#999"
              />
              <Pressable onPress={() => setSenhaVisivel(!senhaVisivel)}>
                <Ionicons
                  name={senhaVisivel ? "eye-off" : "eye"}
                  size={22}
                  color="#fff"
                />
              </Pressable>
            </View>

            <View style={styles.buttonContainer}>
              <Button title="Criar" color="#00849e" onPress={handleCriarConta} />
            </View>
          </View>

        </KeyboardAvoidingView>
        {/* BLOCO INFERIOR */}
        <Text style={styles.copyright}>
          All rights reserved. ©ControlARQ 2026
        </Text>
      </SafeAreaView>
    </LinearGradient >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  topSection: {
    alignItems: "center",
    flex: 1.3,
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
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "600",
  },
  imageCroqui: {
    width: "85%",
    height: "45%",
    maxHeight: 130,
    alignSelf: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    height: 44,
    borderColor: "#fff",
    borderWidth: 2,
    marginBottom: 15,
    color: "#fff",
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  passwordInput: {
    flex: 1,
    height: 44,
    color: "#fff",
  },
  buttonContainer: {
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#fff",
    borderWidth: 2,
    borderRadius: 6,
    marginBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 12,
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
  },
});
