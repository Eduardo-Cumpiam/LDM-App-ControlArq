// TelaCadastroEtapas.tsx
// Tela para cadastro de etapas de projetos, acessível apenas para usuários com perfil de Gestor
// Esta tela é protegida pela navegação condicional no AppNavigator, garantindo que apenas gestores possam acessá-la. O formulário de cadastro inclui campos para nome da etapa, descrição, data de início e data de término, e utiliza o Firebase Firestore para armazenar os dados das etapas cadastradas.
//===================================================================================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import AppHeader from "../components/AppHeader";
import AppCopyrigth from "../components/AppCopyrigth";
import { useBackHandlerLogout } from "../hooks/useBackHandlerLogout";
import { RootStackParamList } from "../navigation/AppNavigator";

// Firebase
import { db } from "../services/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";

type TelaCadastroEtapasNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaCadastroEtapas">;

type Props = {
  navigation: TelaCadastroEtapasNavigationProp;
};

interface Etapa {
  id: string;
  nome_etapa: string;
}

export default function TelaCadastroEtapas({ navigation }: Props) {

  const { usuarioLogado, perfil, logout } = useAuth();

  const [nomeEtapa, setNomeEtapa] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ordem, setOrdem] = useState("");

  const [carregando, setCarregando] = useState(false);

  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [sugestoes, setSugestoes] = useState<Etapa[]>([]);

  // ✅ Hook para logout ao pressionar o botão de voltar
  useBackHandlerLogout();

  // ✅ Verifica se o usuário ainda está logado quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      if (!usuarioLogado) {
        // O NavigatorInterno vai renderizar o stack de login automaticamente
        console.log('Usuário não está logado');
      }
    }, [usuarioLogado])
  );

  const handleLogout = async () => {
    await logout();
    // ⚠️ NÃO navegue para TelaLogin
    // O NavigatorInterno vai renderizar o stack de login automaticamente
  };

  // ====================================================
  // Segurança
  // ====================================================

  if (!perfil || perfil.nivel_acesso !== "gestor") {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000060",
        }}
      >
        <Text style={{ color: "#fff" }}>
          Acesso restrito a gestores.
        </Text>
      </SafeAreaView>
    );
  }

  // ====================================================
  // Carregar etapas uma única vez
  // ====================================================

  useEffect(() => {
    carregarEtapas();
  }, []);

  const carregarEtapas = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "etapas")
      );

      const lista: Etapa[] = [];

      snapshot.forEach((docSnap) => {
        const dados = docSnap.data();

        lista.push({
          id: docSnap.id,
          nome_etapa: dados.nome_etapa || "",
        });
      });

      setEtapas(lista);
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível carregar as etapas."
      );
    }
  };

  // ====================================================
  // Sugestões locais
  // ====================================================

  useEffect(() => {
    if (nomeEtapa.trim().length > 0) {
      const filtradas = etapas.filter((e) =>
        e.nome_etapa
          .toLowerCase()
          .includes(nomeEtapa.toLowerCase())
      );

      setSugestoes(filtradas);
    } else {
      setSugestoes([]);
    }
  }, [nomeEtapa, etapas]);

  // ====================================================
  // Salvar
  // ====================================================

  const handleSalvarEtapa = async () => {
    if (!nomeEtapa.trim()) {
      Alert.alert(
        "Atenção",
        "Informe o nome da etapa."
      );
      return;
    }

    if (!ordem.trim()) {
      Alert.alert(
        "Atenção",
        "Informe a ordem da etapa."
      );
      return;
    }

    const existe = etapas.some(
      (e) =>
        e.nome_etapa.trim().toLowerCase() ===
        nomeEtapa.trim().toLowerCase()
    );

    if (existe) {
      Alert.alert(
        "Atenção",
        "Já existe uma etapa com este nome."
      );
      return;
    }

    try {
      setCarregando(true);

      const docRef = await addDoc(
        collection(db, "etapas"),
        {
          nome_etapa: nomeEtapa.trim(),
          descricao: descricao.trim(),
          ordem: Number(ordem),

          status: "ativo",

          data_cadastro:
            Timestamp.fromDate(new Date()),

          data_atualizacao:
            Timestamp.fromDate(new Date()),

          gestor_id: usuarioLogado?.uid || "",
        }
      );

      setEtapas((prev) => [
        ...prev,
        {
          id: docRef.id,
          nome_etapa: nomeEtapa.trim(),
        },
      ]);

      Alert.alert(
        "Sucesso",
        "Etapa cadastrada com sucesso."
      );

      setNomeEtapa("");
      setDescricao("");
      setOrdem("");
      setSugestoes([]);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.message ||
          "Não foi possível salvar."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient 
        colors={["#000060", "#3232B5", "#00007D"]}
        style={styles.container}
      >
        <AppHeader
          nomeUsuario={perfil?.nome}
          onLogout={handleLogout}
          mostrarVoltar={true}
          onVoltar={() => {
            navigation.navigate("TelaGestao");
          }}
        />

        <KeyboardAvoidingView
          style={styles.contentWrapper}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.headerSection}>
              <Text style={styles.title}>Nova Etapa</Text>
              <Text style={styles.description}>Cadastro de etapas utilizadas nos projetos.</Text>
            </View>

            <Text style={styles.label}>Nome da Etapa</Text>

            <TextInput
              style={styles.input}
              value={nomeEtapa}
              onChangeText={setNomeEtapa}
              placeholder="Ex.: Fundação"
              placeholderTextColor="#999"
            />

            {sugestoes.length > 0 && (
              <View style={styles.sugestoesWrapper}>
                {sugestoes.map((item) => (
                  <Text
                    key={item.id}
                    style={styles.sugestao}
                  >
                    {item.nome_etapa}
                  </Text>
                ))}
              </View>
            )}

            <Text style={styles.label}>Descrição</Text>

            <TextInput
              style={[styles.input, { height: 100 }]}
              multiline
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Descrição da etapa"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Ordem</Text>

            <TextInput
              style={styles.input}
              value={ordem}
              onChangeText={setOrdem}
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor="#999"
            />

            {carregando ? (
              <ActivityIndicator
                size="large"
                color="#86EBFF"
                style={{ marginTop: 20 }}
              />
            ) : (
              <View style={styles.buttonContainer}>
                <Button
                  title="Salvar Etapa"
                  color="#00849e"
                  onPress={handleSalvarEtapa}
                />
              </View>
            )}
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
    paddingVertical: 10,
  },

  headerSection: {
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },

  description: {
    fontSize: 13,
    color: "#86EBFF",
    textAlign: "center",
    marginTop: 5,
  },

  label: {
    color: "#fff",
    marginBottom: 5,
    fontWeight: "600",
  },

  input: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 12,
    color: "#fff",
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  buttonContainer: {
    marginTop: 10,
    borderRadius: 6,
    overflow: "hidden",
  },

  sugestoesWrapper: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "#86EBFF",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },

  sugestao: {
    color: "#86EBFF",
    paddingVertical: 2,
  },
});
