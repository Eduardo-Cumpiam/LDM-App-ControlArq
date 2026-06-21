// TelaCriarConta.tsx
// Tela de Criação de Conta alinhada ao fluxo de cadastro inicial sempre pendente com inclusão de telefone.
// Utiliza o AuthContext para registrar o usuário no Firebase Auth e salvar o perfil no Firestore.
// Esta tela é a primeira que o usuário vê ao abrir o aplicativo pela primeira vez
//=====================================================================================================================

import React, { useState } from "react";
import {
  Text,
  Button,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AppCopyrigth from "../components/AppCopyrigth";
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
  const [telefone, setTelefone] = useState("");

  const { cadastrarNovoFuncionario } = useAuth();

  const handleCriarConta = async () => {
    if (!email || !senha || !nome || !telefone) {
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

      // ✅ Sincronizado estritamente com a assinatura do AuthContext atualizado
      await cadastrarNovoFuncionario(
        user.uid,
        nome,
        email.trim(),
        "colaborador",   // nível_acesso inicial
        0,               // valorHora inicial (número)
        telefone.trim()  // telefone (string)
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
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#000060", "#3232B5", "#00007D"]} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.contentWrapper}
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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

              {/* Campo: TELEFONE */}
              <Text style={styles.subtitle}>TELEFONE / WHATSAPP:</Text>
              <TextInput
                style={styles.input}
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
                placeholder="Ex: 14999999999"
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

          </ScrollView>
          <AppCopyrigth />
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  topSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  formSection: {
    width: "100%",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "600",
  },
  imageCroqui: {
    width: "85%",
    height: 110,
    alignSelf: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    height: 44,
    borderColor: "#fff",
    borderWidth: 2,
    marginBottom: 14,
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
    marginTop: 5,
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
});
