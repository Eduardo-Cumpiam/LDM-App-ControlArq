// TelaGestaoEtapas.tsx
// Gestão de Etapas
// Permite listar, editar e inativar etapas cadastradas.
// ==================================================================

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
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
import { globalStyles } from "../styles/globalStyles";

import { db } from "../services/firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

type TelaGestaoEtapasNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TelaGestaoEtapas"
>;

type Props = {
  navigation: TelaGestaoEtapasNavigationProp;
};

interface Etapa {
  id: string;
  nome_etapa: string;
  descricao?: string;
  ordem?: number;
  status: string;
}

export default function TelaGestaoEtapas({ navigation }: Props) {
  const { usuarioLogado, perfil, logout } = useAuth();

  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [carregando, setCarregando] = useState(true);

  useBackHandlerLogout();

  useFocusEffect(
    useCallback(() => {
      if (!usuarioLogado) {
        console.log("Usuário não está logado");
      }
    }, [usuarioLogado]),
  );

  const handleLogout = async () => {
    await logout();
  };

  const carregarEtapas = async () => {
    try {
      setCarregando(true);

      const snapshot = await getDocs(collection(db, "etapas"));
      const lista: Etapa[] = [];

      snapshot.forEach((docSnap) => {
        const dados = docSnap.data();

        lista.push({
          id: docSnap.id,
          nome_etapa: dados.nome_etapa || "",
          descricao: dados.descricao || "",
          ordem: dados.ordem || 0,
          status: dados.status || "ativo",
        });
      });

      lista.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

      setEtapas(lista);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as etapas.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarEtapas();
  }, []);

  const atualizarEtapa = async (
    id: string,
    nome: string,
    descricao: string,
    ordem: number,
  ) => {
    try {
      await updateDoc(doc(db, "etapas", id), {
        nome_etapa: nome,
        descricao,
        ordem,
      });

      Alert.alert("Sucesso", "Etapa atualizada.");
      carregarEtapas();
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar.");
    }
  };

  const alterarStatus = async (id: string, statusAtual: string) => {
    try {
      const novoStatus = statusAtual === "ativo" ? "inativo" : "ativo";

      await updateDoc(doc(db, "etapas", id), {
        status: novoStatus,
      });

      carregarEtapas();
    } catch {
      Alert.alert("Erro", "Falha ao alterar status.");
    }
  };

  if (!perfil || perfil.nivel_acesso !== "gestor") {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.restrictedContainer}>
          <Text style={styles.restrictedText}>Acesso restrito a gestores.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <LinearGradient
        colors={[colors.primarySoft, colors.background]}
        style={styles.container}
      >
        <AppHeader
          nomeUsuario={perfil.nome}
          onLogout={handleLogout}
          mostrarVoltar={true}
          onVoltar={() => {
            navigation.navigate("TelaGestao");
          }}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={globalStyles.title}>Gestão de Etapas</Text>

          <Text style={[globalStyles.description, styles.description]}>
            Edite, organize ou inative etapas do sistema.
          </Text>

          {carregando ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 40 }}
            />
          ) : (
            etapas.map((etapa) => (
              <CardEtapa
                key={etapa.id}
                etapa={etapa}
                onSalvar={atualizarEtapa}
                onAlterarStatus={alterarStatus}
              />
            ))
          )}
        </ScrollView>

        <AppCopyrigth />
      </LinearGradient>
    </SafeAreaView>
  );
}

interface CardProps {
  etapa: Etapa;
  onSalvar: (
    id: string,
    nome: string,
    descricao: string,
    ordem: number,
  ) => void;

  onAlterarStatus: (id: string, statusAtual: string) => void;
}

function CardEtapa({ etapa, onSalvar, onAlterarStatus }: CardProps) {
  const [nome, setNome] = useState(etapa.nome_etapa);
  const [descricao, setDescricao] = useState(etapa.descricao || "");
  const [ordem, setOrdem] = useState(String(etapa.ordem || 0));

  // Sincroniza o estado local caso a lista seja atualizada via servidor
  useEffect(() => {
    setNome(etapa.nome_etapa);
    setDescricao(etapa.descricao || "");
    setOrdem(String(etapa.ordem || 0));
  }, [etapa]);

  const isAtivo = etapa.status === "ativo";

  return (
    <View style={styles.card}>
      <Text style={globalStyles.label}>Nome da Etapa</Text>
      <TextInput
        style={[globalStyles.input, globalStyles.inputText]}
        value={nome}
        onChangeText={setNome}
        placeholderTextColor={colors.textLight}
        placeholder="Digite o nome da etapa"
      />

      <Text style={globalStyles.label}>Descrição</Text>
      <TextInput
        style={[globalStyles.input, globalStyles.inputText]}
        value={descricao}
        onChangeText={setDescricao}
        placeholderTextColor={colors.textLight}
        placeholder="Digite a descrição da etapa"
      />

      <Text style={globalStyles.label}>Ordem de Exibição</Text>
      <TextInput
        style={[globalStyles.input, globalStyles.inputText]}
        keyboardType="numeric"
        value={ordem}
        onChangeText={setOrdem}
        placeholderTextColor={colors.textLight}
        placeholder="0"
      />

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status:</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isAtivo ? colors.primarySoft : "#FFEBEE" },
          ]}
        >
          <Text
            style={[
              styles.statusValue,
              { color: isAtivo ? colors.success : colors.danger },
            ]}
          >
            {isAtivo ? "Ativo" : "Inativo"}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[globalStyles.buttonPrimary, styles.buttonFlex]}
          onPress={() =>
            onSalvar(etapa.id, nome, descricao, Number(ordem) || 0)
          }
          activeOpacity={0.8}
        >
          <Text style={globalStyles.buttonPrimaryText}>Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.buttonStatus,
            styles.buttonFlex,
            { backgroundColor: isAtivo ? colors.danger : colors.warning },
          ]}
          onPress={() => onAlterarStatus(etapa.id, etapa.status)}
          activeOpacity={0.8}
        >
          <Text style={globalStyles.buttonPrimaryText}>
            {isAtivo ? "Inativar" : "Ativar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    color: colors.primarySoft,
    fontWeight: "bold",
    textAlign: "center",
  },

  description: {
    color: colors.primaryLight,
    textAlign: "center",
    marginBottom: 20,
  },

  restrictedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  restrictedText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },

  listContainer: {
    marginTop: 20,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },

  statusLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "500",
    marginRight: 8,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },

  statusValue: {
    fontSize: 12,
    fontWeight: "bold",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 4,
  },

  buttonFlex: {
    flex: 1,
    marginTop: 0, // Sobrescreve o marginTop do globalStyles.buttonPrimary
  },

  buttonStatus: {
    height: 44,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    color: colors.white,
    marginBottom: 4,
    fontSize: 13,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 42,
    color: colors.white,
    marginBottom: 10,
  },

  status: {
    marginBottom: 12,
    fontWeight: "600",
  },
});
