// TelaCadastroEtapas.tsx
// Tela para cadastro de etapas de projetos, acessível apenas para usuários com perfil de Gestor
// Esta tela é protegida pela navegação condicional no AppNavigator, garantindo que apenas gestores possam acessá-la. O formulário de cadastro inclui campos para nome da etapa, descrição, data de início e data de término, e utiliza o Firebase Firestore para armazenar os dados das etapas cadastradas.
//===================================================================================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
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
import { colors } from "../styles/colors";

// Firebase
import { db } from "../services/firebaseConfig";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";

type TelaCadastroEtapasNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TelaCadastroEtapas"
>;

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
        console.log("Usuário não está logado");
      }
    }, [usuarioLogado]),
  );

  // ====================================================
  // Carregar etapas uma única vez
  // ====================================================
  useEffect(() => {
    carregarEtapas();
  }, []);

  // ====================================================
  // Sugestões locais
  // ====================================================
  useEffect(() => {
    if (nomeEtapa.trim().length > 0) {
      const filtradas = etapas.filter((e) =>
        e.nome_etapa.toLowerCase().includes(nomeEtapa.toLowerCase()),
      );

      setSugestoes(filtradas);
    } else {
      setSugestoes([]);
    }
  }, [nomeEtapa, etapas]);

  // ✅ 2. Métodos e funções auxiliares
  const carregarEtapas = async () => {
    try {
      const snapshot = await getDocs(collection(db, "etapas"));
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
      Alert.alert("Erro", "Não foi possível carregar as etapas.");
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // ====================================================
  // Salvar
  // ====================================================
  const handleSalvarEtapa = async () => {
    if (!nomeEtapa.trim()) {
      Alert.alert("Atenção", "Informe o nome da etapa.");
      return;
    }

    if (!ordem.trim()) {
      Alert.alert("Atenção", "Informe a ordem da etapa.");
      return;
    }

    const existe = etapas.some(
      (e) =>
        e.nome_etapa.trim().toLowerCase() === nomeEtapa.trim().toLowerCase(),
    );

    if (existe) {
      Alert.alert("Atenção", "Já existe uma etapa com este nome.");
      return;
    }

    try {
      setCarregando(true);

      const docRef = await addDoc(collection(db, "etapas"), {
        nome_etapa: nomeEtapa.trim(),
        descricao: descricao.trim(),
        ordem: Number(ordem),
        status: "ativo",
        data_cadastro: Timestamp.fromDate(new Date()),
        data_atualizacao: Timestamp.fromDate(new Date()),
        gestor_id: usuarioLogado?.uid || "",
      });

      setEtapas((prev) => [
        ...prev,
        {
          id: docRef.id,
          nome_etapa: nomeEtapa.trim(),
        },
      ]);

      Alert.alert("Sucesso", "Etapa cadastrada com sucesso.");

      setNomeEtapa("");
      setDescricao("");
      setOrdem("");
      setSugestoes([]);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível salvar.");
    } finally {
      setCarregando(false);
    }
  };

  // ====================================================
  // Segurança
  // ====================================================
  if (!perfil || perfil.nivel_acesso !== "gestor") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <LinearGradient
          colors={[colors.primarySoft, colors.background]}
          style={styles.containerRestrito}
        >
          <Text style={styles.textoRestrito}>Acesso restrito a gestores.</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // ✅ 4. Return Principal da Interface
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.primarySoft, colors.background]}
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
              <Text style={styles.description}>
                Cadastro de etapas utilizadas nos projetos.
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Nome da Etapa</Text>
              <TextInput
                style={styles.input}
                value={nomeEtapa}
                onChangeText={setNomeEtapa}
                placeholder="Ex.: Fundação"
                placeholderTextColor={colors.textLight}
              />

              {sugestoes.length > 0 && (
                <View style={styles.sugestoesWrapper}>
                  {sugestoes.map((item) => (
                    <Text key={item.id} style={styles.sugestao}>
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
                placeholder="Descrição detalhada da etapa..."
                placeholderTextColor={colors.textLight}
              />

              <Text style={styles.label}>Ordem de Execução:</Text>
              <TextInput
                style={styles.input}
                value={ordem}
                onChangeText={setOrdem}
                keyboardType="numeric"
                placeholder="Ex: 1"
                placeholderTextColor={colors.textLight}
              />

              {carregando ? (
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                  style={{ marginVertical: 15 }}
                />
              ) : (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSalvarEtapa}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>Salvar Etapa</Text>
                </TouchableOpacity>
              )}
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
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  containerRestrito: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  textoRestrito: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  headerSection: {
    alignItems: "center",
    marginBottom: 15,
  },
  formSection: {
    width: "100%",
    flex: 1,
  },

  title: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },

  description: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },

  label: {
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 6,
    fontWeight: "600",
  },

  input: {
    height: 44,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    marginBottom: 14,
    color: colors.textPrimary,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.inputBackground,
  },

  textArea: {
    height: 90,
    paddingTop: 10,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: colors.white || "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  sugestoesWrapper: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },

  sugestao: {
    fontSize: 13,
    color: colors.warning,
    paddingVertical: 3,
  },
});
