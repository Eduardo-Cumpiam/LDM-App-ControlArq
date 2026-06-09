// TelaLogin.tsx
// Tela de Login com direcionamento condicional baseado no nível de acesso do usuário.
// Após autenticação, utiliza o perfil carregado pelo AuthContext para decidir a navegação:
// - Usuário comum → TelaInicial
// - Gestor → TelaGestorInicial
// Inclui ajuste para evitar que o teclado cubra os campos de entrada.
// ====================================================================================================================

import React, { useState, useEffect } from "react";
import {
  Text,
  Button,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

// Firebase Auth
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

type RootStackParamList = {
  TelaCriarConta: undefined;
  TelaLogin: undefined;
  TelaInicial: undefined;
  TelaGestorInicial: undefined;
};

type TelaLoginNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TelaLogin"
>;

type Props = {
  navigation: TelaLoginNavigationProp;
};

export default function TelaLogin({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregandoInterno, setCarregandoInterno] = useState(false);

  const { login, perfil, carregando } = useAuth();

  // ✅ Redirecionamento seguro após perfil ser carregado
  useEffect(() => {
    if (!carregando && perfil) {
      if (perfil.status === "autorizado") {
        if (perfil.nivel_acesso === "gestor") {
          navigation.replace("TelaGestorInicial");
        } else {
          navigation.replace("TelaInicial");
        }
      } else if (perfil.status === "pendente") {
        Alert.alert("Acesso pendente", "Seu cadastro ainda não foi autorizado pelo gestor.");
      } else if (perfil.status === "excluído") {
        Alert.alert("Acesso negado", "Seu cadastro foi desativado pelo gestor.");
      }
    }
  }, [perfil, carregando]);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      setCarregandoInterno(true);
      await login(email.trim(), senha);
      // Navegação agora é feita pelo useEffect quando perfil estiver pronto
    } catch (error: any) {
      Alert.alert("Erro ao entrar", error.message);
    } finally {
      setCarregandoInterno(false);
    }
  };

  const redefinirSenha = async () => {
    if (!email) {
      Alert.alert("Atenção", "Digite o email para redefinir a senha.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        "Email enviado",
        "Verifique sua caixa de entrada para redefinir a senha."
      );
    } catch (error: any) {
      Alert.alert("Erro ao enviar email", error.message);
    }
  };

  return (
    <LinearGradient
      colors={["#000060", "#3232B5", "#00007D"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.contentWrapper}>
          {/* BLOCO SUPERIOR */}
          <View style={styles.topSection}>
            <Text style={styles.title}>
              Controle para seus projetos de arquitetura na palma da sua mão.
            </Text>
            <Image
              source={require("../../assets/croqui.png")}
              style={styles.imageCroqui}
              resizeMode="contain"
            />
          </View>

          {/* BLOCO CENTRAL */}
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

            {carregandoInterno ? (
              <ActivityIndicator
                size="large"
                color="#86EBFF"
                style={{ marginVertical: 10 }}
              />
            ) : (
              <>
                <View style={styles.buttonContainer}>
                  <Button title="Entrar" color="#00849e" onPress={handleLogin} />
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    title="Esqueci minha senha"
                    color="#86EBFF"
                    onPress={redefinirSenha}
                  />
                </View>
              </>
            )}
          </View>

          {/* BLOCO INFERIOR */}
          <View style={styles.footerSection}>
            <Pressable onPress={() => navigation.replace("TelaCriarConta")}>
              <Text style={styles.footerLink}>
                não possui conta? crie a sua
              </Text>
            </Pressable>

            <Text style={styles.footerText}>
              All rights reserved. ©ControlARQ 2026
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
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
    flex: 1.8,
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
    fontSize: 25,
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "600",
    marginTop: 100,
  },
  imageCroqui: {
    width: "200%",
    maxHeight: 200,
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
  footerText: {
    fontSize: 11,
    color: "#86EBFF",
    textAlign: "center",
    opacity: 0.6,
  },
});
