// TelaCadastroEtapas.tsx
// Tela para cadastro de etapas de projetos, acessível apenas para usuários com perfil de Gestor
// Esta tela é protegida pela navegação condicional no AppNavigator, garantindo que apenas gestores possam acessá-la. O formulário de cadastro inclui campos para nome da etapa, descrição, data de início e data de término, e utiliza o Firebase Firestore para armazenar os dados das etapas cadastradas.
//===================================================================================================================

// TelaCadastroEtapa.tsx
//===================================================================================

import React, { useState } from "react";
import {
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "../services/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function TelaCadastroEtapa() {
  const [nomeEtapa, setNomeEtapa] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSalvarEtapa = async () => {
    if (!nomeEtapa) {
      Alert.alert("Atenção", "Informe o nome da etapa.");
      return;
    }

    try {
      setCarregando(true);

      await addDoc(collection(db, "etapas"), {
        nome_etapa: nomeEtapa,
        data_cadastro: new Date().toISOString(),
        status: "Ativo",
      });

      Alert.alert("Sucesso!", "Etapa cadastrada com sucesso!");
      setNomeEtapa("");
    } catch (error: any) {
      Alert.alert("Erro ao salvar", error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <LinearGradient colors={["#000060", "#3232B5", "#00007D"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.contentWrapper}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Nova Etapa</Text>
            <Text style={styles.description}>Cadastre uma etapa para ser utilizada nos projetos.</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Nome da Etapa:</Text>
            <TextInput
              style={styles.input}
              value={nomeEtapa}
              onChangeText={setNomeEtapa}
              placeholder="Ex: Fundação, Estrutura, Acabamento"
              placeholderTextColor="#999"
            />

            <View style={styles.buttonContainer}>
              <Button title="Salvar Etapa" color="#00849e" onPress={handleSalvarEtapa} disabled={carregando} />
            </View>
          </View>

          <View style={styles.footerSection}>
            <Text style={styles.footerText}>ControlARQ 2026 © All rights reserved.</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: { flex: 1, paddingHorizontal: 25, justifyContent: "space-between", paddingVertical: 10 },
  headerSection: { alignItems: "center", flex: 0.5, justifyContent: "center" },
  formSection: { width: "100%", flex: 4, justifyContent: "center" },
  footerSection: { alignItems: "center", justifyContent: "flex-end", paddingBottom: 5 },
  title: { fontSize: 24, color: "#fff", fontWeight: "bold", textAlign: "center", marginBottom: 3 },
  description: { fontSize: 13, color: "#86EBFF", textAlign: "center" },
  label: { fontSize: 13, color: "#fff", marginBottom: 4, fontWeight: "500" },
  input: {
    height: 42,
    borderColor: "#fff",
    borderWidth: 2,
    marginBottom: 12,
    color: "#fff",
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
  },
  buttonContainer: { borderRadius: 6, overflow: "hidden", marginTop: 5 },
  footerText: { fontSize: 11, color: "#86EBFF", opacity: 0.5 },
});
