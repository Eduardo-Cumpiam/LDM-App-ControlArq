// TelaProjetos.tsx
// Tela de Projetos para exibição e lançamento de horas em tempo real do Firestore
// Ajustada para exibir cores dos projetos e atuar puramente como central de lançamentos
// ====================================================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppCopyrigth from "../components/AppCopyrigth";
import AppHeader from "../components/AppHeader";

// Contexto
import { useAuth } from "../context/AuthContext";
import { useBackHandlerLogout } from "../hooks/useBackHandlerLogout";

// Firebase
import { db } from "../services/firebaseConfig";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

interface Projeto {
  id: string;
  nome_projeto: string;
  cor_projeto: string; // ✅ Adicionado para mapear a cor vinda do cadastro
}

export default function TelaProjetos() {
  const { usuarioLogado, perfil, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
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

  useEffect(() => {
    const q = query(
      collection(db, "projetos"),
      orderBy("data_criacao", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const listaProjetos: Projeto[] = [];
        querySnapshot.forEach((doc) => {
          const dados = doc.data();
          listaProjetos.push({
            id: doc.id,
            nome_projeto: dados.nome_projeto || "Sem nome_projeto",
            cor_projeto: dados.cor_projeto || "#86EBFF",
          });
        });
        setProjetos(listaProjetos);
        setCarregando(false);
      },
      (error) => {
        console.error("Erro ao buscar projetos: ", error);
        setCarregando(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const renderItemProjeto = ({ item }: { item: Projeto }) => (
    <View style={styles.card}>
      {/* ✅ Barra lateral que identifica visualmente a cor definida no cadastro */}
      <View
        style={[styles.colorIndicator, { backgroundColor: item.cor_projeto }]}
      />

      <View style={styles.content}>
        {/* O nome do projeto herda a cor dinâmica para criar uma identidade visual forte */}
        <Text style={[styles.projectTitle, { color: item.cor_projeto }]}>
          {item.nome_projeto.toUpperCase()}
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => {
            navigation.navigate("TelaLancamentoHoras", {
              projetoId: item.id,
              projetoNome: item.nome_projeto,
            });
          }}
        >
          <Text style={styles.buttonText}>LANÇAR HORAS</Text>
        </Pressable>
      </View>
    </View>
  );

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
          onVoltar={() => navigation.goBack()}
        />

        <View style={styles.header}>
          <Text style={styles.namepage}>CENTRAL DE PROJETOS</Text>
        </View>

        {carregando ? (
          <ActivityIndicator size="large" color="#86EBFF" style={{ flex: 1 }} />
        ) : perfil?.status !== "autorizado" ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={[
                styles.emptyText,
                { opacity: 1, fontSize: 18, fontWeight: "bold" },
              ]}
            >
              Acesso Pendente
            </Text>
            <Text style={[styles.emptyText, { marginTop: 10 }]}>
              Seu cadastro está aguardando a liberação do gestor para acessar os
              projetos.
            </Text>
          </View>
        ) : (
          <FlatList
            data={projetos}
            keyExtractor={(item) => item.id}
            renderItem={renderItemProjeto}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhum projeto cadastrado no momento.
              </Text>
            }
          />
        )}
        <AppCopyrigth />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  namepage: { fontSize: 22, color: "#fff", marginTop: 10, fontWeight: "bold" },
  card: {
    width: "100%",
    marginTop: 15,
    backgroundColor: "#0017c9",
    borderRadius: 15,
    elevation: 6,
    overflow: "hidden",
    flexDirection: "row", // Alinha a barra de cor com o conteúdo do card
  },
  colorIndicator: {
    width: 12, // Espessura do indicador de cor na lateral esquerda
    height: "100%",
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: "center",
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#00aeff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    opacity: 0.6,
  },
});
