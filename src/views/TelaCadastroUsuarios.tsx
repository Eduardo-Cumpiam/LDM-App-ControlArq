// TelaCadastroUsuarios.tsx
// Tela para cadastro de usuários (supervisor e colaborador), acessível apenas para gestores
// Esta tela é protegida e só pode ser acessada por usuários com perfil de gestor, garantindo que apenas pessoas autorizadas possam criar novos usuários no sistema. A navegação para esta tela é controlada pelo AppNavigator, que verifica o perfil do usuário antes de permitir o acesso.
//==================================================================================================================

import React, { useState } from "react";
import {
  Text,
  Button,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Alert,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";

// Firebase
import { auth, db } from "../services/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

type RootStackParamList = {
  TelaCadastroUsuarios: undefined;
  TelaGestao: undefined;
};

type TelaCadastroUsuariosNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TelaCadastroUsuarios"
>;

type Props = {
  navigation: TelaCadastroUsuariosNavigationProp;
};

export default function TelaCadastroUsuarios({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("supervisor"); // valor inicial

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const cadastrarUsuario = async () => {
    if (!email || !senha || !cargo) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert("Email inválido", "Digite um email válido no formato seuemail@provedor.com.");
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Senha inválida", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), senha);
      const user = cred.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        id_usuario: user.uid,
        email: user.email,
        nivel_acesso: cargo, // supervisor ou colaborador
        data_cadastro: new Date().toISOString(),
      });

      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Erro ao cadastrar usuário", error.message);
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
          {/* BLOCO SUPERIOR: Título */}
          <View style={styles.topSection}>
            <Text style={styles.title}>Cadastro de Usuários</Text>
            <Text style={styles.subtitle}>
              Apenas o gestor pode cadastrar supervisores e colaboradores
            </Text>
          </View>

          {/* BLOCO CENTRAL: Formulário */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="seu-email@provedor.com"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Senha:</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
              autoCapitalize="none"
              placeholder="******"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Cargo:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={cargo}
                onValueChange={(itemValue) => setCargo(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Supervisor" value="supervisor" />
                <Picker.Item label="Colaborador" value="colaborador" />
              </Picker>
            </View>

            <View style={styles.buttonContainer}>
              <Button title="Cadastrar" color="#00849e" onPress={cadastrarUsuario} />
            </View>
          </View>

          {/* BLOCO INFERIOR: Rodapé */}
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>
              All rights reserved. ©ControlARQ 2026
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    fontSize: 22,
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#86EBFF",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
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
  pickerWrapper: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 6,
    marginBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  picker: {
    color: "#fff",
  },
  buttonContainer: {
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 10,
  },
  footerText: {
    fontSize: 11,
    color: "#86EBFF",
    textAlign: "center",
    opacity: 0.6,
  },
});
