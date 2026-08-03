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
  TouchableOpacity,
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
import { globalStyles } from "../styles/globalStyles";
import { colors } from "../styles/colors";

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.primarySoft, colors.background]} style={styles.container}>
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

              {/*
              <Image
                source={require("../../assets/croqui.png")}
                style={styles.imageCroqui}
                resizeMode="contain"
              />
              */}

            </View>

            {/* BLOCO CENTRAL */}
            <View style={styles.formSection}>
              <Text style={globalStyles.label}>NOME:</Text>
              <TextInput
                style={globalStyles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome completo"
                placeholderTextColor={colors.textLight}
              />

              {/* Campo: TELEFONE */}
              <Text style={globalStyles.label}>TELEFONE / WHATSAPP:</Text>
              <TextInput
                style={globalStyles.input}
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
                placeholder="Ex: 14999999999"
                placeholderTextColor={colors.textLight}
              />

              <Text style={globalStyles.label}>E-MAIL:</Text>
              <TextInput
                style={globalStyles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="seu-email@provedor.com"
                placeholderTextColor={colors.textLight}
              />

              <Text style={globalStyles.label}>SENHA:</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  secureTextEntry={!senhaVisivel}
                  value={senha}
                  onChangeText={setSenha}
                  autoCapitalize="none"
                  placeholder="Digite sua senha"
                  placeholderTextColor={colors.textLight}
                />
                <Pressable onPress={() => setSenhaVisivel(!senhaVisivel)} style={styles.eyeIcon}>
                  <Ionicons
                    name={senhaVisivel ? "eye-off" : "eye"}
                    size={22}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>

              <TouchableOpacity 
                style={globalStyles.buttonPrimary} 
                onPress={handleCriarConta}
                activeOpacity={0.8}
              >
                <Text style={globalStyles.buttonPrimaryText}>Criar Conta</Text>
              </TouchableOpacity>

              {/*}

              <View style={styles.buttonContainer}>
                <Button title="Criar" color="#00849e" onPress={handleCriarConta} />
              </View>

              */}
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
    height: "100%",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    color: colors.textPrimary,
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
    height: "100%",
    color: colors.textPrimary,
    fontSize: 16,
  },
  buttonContainer: {
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 16,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 12,
    height: 48,
  },
  eyeIcon: {
    padding: 4,
  },
});
