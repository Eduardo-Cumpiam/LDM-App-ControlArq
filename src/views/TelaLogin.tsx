// TelaLogin.tsx
// Tela de Login com direcionamento condicional baseado no nível de acesso do usuário.
// Após autenticação, utiliza o perfil carregado pelo AuthContext para decidir a navegação:
// - Usuário comum → TelaInicial
// - Gestor → TelaGestorInicial
// Inclui ajuste para evitar que o teclado cubra os campos de entrada e agora também inclui login via Google.
// ====================================================================================================================

import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Button,
  TextInput,
  Image,
  Pressable,
  ScrollView,
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
import { Ionicons } from "@expo/vector-icons";
import AppCopyrigth from "../components/AppCopyrigth";

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
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [carregandoInterno, setCarregandoInterno] = useState(false);

  const { login, perfil, carregando } = useAuth();

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
      } else if (perfil.status === "excluido") {
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
    } catch (error: any) {
      const mensagem = error?.message ?? "Falha inesperada no login.";
      Alert.alert("Erro ao entrar", mensagem);
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
      Alert.alert("Email enviado", "Verifique sua caixa de entrada para redefinir a senha. Se o email estiver na lixeira, mover para a caixa de entrada");
    } catch (error: any) {
      Alert.alert("Erro ao enviar email", error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#000060", "#3232B5", "#00007D"]} style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
        >

          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentWrapper}>
              {/* BLOCO SUPERIOR */}
              <View style={styles.topSection}>
                <Text style={styles.title}>ControlArq</Text>
                <Text style={styles.title2}>
                  Controle para seus projetos de arquitetura na palma da sua mão.
                </Text>
                <Image
                  source={require("../../assets/croqui4.png")}
                  style={styles.imageCroqui}
                  resizeMode="contain"
                />
              </View>

              {/* BLOCO CENTRAL */}
              <View style={styles.formSection}>
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
                    style={styles.inputSenha}
                    secureTextEntry={!senhaVisivel}
                    value={senha}
                    onChangeText={setSenha}
                    autoCapitalize="none"
                    placeholder="******"
                    placeholderTextColor="#999"
                  />
                  <Pressable onPress={() => setSenhaVisivel(!senhaVisivel)}>
                    <Ionicons
                      name={senhaVisivel ? "eye-off" : "eye"}
                      size={22}
                      color="#fff"
                      style={{ marginLeft: 8 }}
                    />
                  </Pressable>
                </View>

                {carregandoInterno ? (
                  <ActivityIndicator size="large" color="#86EBFF" style={{ marginVertical: 10 }} />
                ) : (
                  <>
                    <View style={styles.buttonContainer}>
                      <Button title="Entrar" color="#00849e" onPress={handleLogin} />
                    </View>

                    <View style={styles.buttonContainer}>
                      <Pressable onPress={redefinirSenha}>
                        <Text style={styles.linkSenha}>Esqueci minha senha</Text>
                      </Pressable>
                    </View>
                  </>
                )}
                {/*</View>*/}

                {/* BLOCO INFERIOR */}
                <View style={styles.footerSection}>
                  <Pressable onPress={() => navigation.navigate("TelaCriarConta")}>
                    <Text style={styles.footerLink}>Não possui conta? {"\n"}
                      Crie a sua <Text style={styles.linkDestaque}>clicando aqui </Text>
                      e solicite liberação ao seu gestor.</Text>
                  </Pressable>

                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <AppCopyrigth />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 25,
    //    justifyContent: "space-between",
    paddingVertical: 20,
  },
  topSection: {
    alignItems: "center",
    flex: 1.8,
    justifyContent: "center",
  },
  formSection: {
    width: "100%",
    marginTop: 20,
    justifyContent: "center",
    flex: 1.5,
  },
  footerSection: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 25,
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "600",
    //marginTop: 20,
  },
  title2: {
    paddingTop: 20,
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "600",
    //marginTop: 20,
  },
  imageCroqui: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    opacity: 0.7,
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
  inputSenha: {
    flex: 1,
    height: 44,
    color: "#fff",
  },
  linkSenha: {
    fontSize: 15,
    color: "#FFD700",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
  },
  buttonContainer: {
    width: "60%",
    height: 45,
    alignSelf: "center",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 5,
    paddingBottom: 5,
  },
  linkDestaque: {
    color: "#FFD700",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  footerLink: {
    paddingTop: 10,
    fontSize: 15,
    color: "#f5f2f2",
    textAlign: "center",
    marginBottom: 15,
    textDecorationLine: "none",
  },
});
