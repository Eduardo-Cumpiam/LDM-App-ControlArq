// TelaProjetos.tsx
// Tela de Projetos para exibir os projetos cadastrados em tempo real do Firestore
// Ajustada para navegar para TelaLancamentoHoras
// ====================================================================================

import React, { useState, useEffect } from "react";
import { View, Text, Image, Pressable, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Firebase
import { db } from "../services/firebaseConfig";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

// Estrutura do objeto Projeto
interface Projeto {
  id: string;
  nome_projeto: string;
  cliente_associado: string;
  descricao: string;
  horas_orcadas: number;
  horas_gastas: number;
  valor_gasto: number;
  status: string;
}

export default function TelaProjetos() {
  const navigation = useNavigation<any>();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "projetos"), orderBy("data_criacao", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const listaProjetos: Projeto[] = [];
        querySnapshot.forEach((doc) => {
          const dados = doc.data();
          listaProjetos.push({
            id: doc.id,
            nome_projeto: dados.nome_projeto || "Sem nome",
            cliente_associado: dados.cliente_associado || dados.fk_cliente || "Sem cliente",
            descricao: dados.descricao || "Sem descrição.",
            horas_orcadas: dados.horas_orcadas || 0,
            horas_gastas: dados.horas_gastas || 0,
            valor_gasto: dados.valor_gasto || 0,
            status: dados.status || "Ativo",
          });
        });
        setProjetos(listaProjetos);
        setCarregando(false);
      },
      (error) => {
        console.error("Erro ao buscar projetos: ", error);
        setCarregando(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderItemProjeto = ({ item }: { item: Projeto }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: "https://picsum.photos/300/200" }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.projectTitle}>{item.nome_projeto.toUpperCase()}</Text>
        <Text style={styles.clientText}>Cliente: {item.cliente_associado}</Text>
        
        <View style={styles.divider} />

        <Text style={styles.title}>
          Tempo Orcado: <Text style={styles.tempo_estimado}>{item.horas_orcadas}h</Text>
        </Text>

        <Text style={styles.title}>
          Tempo Gasto: <Text style={styles.tempo_gasto}>{item.horas_gastas}h</Text>
        </Text>

        <Text style={styles.title}>
          Custo Atual: <Text style={styles.tempo_gasto}>R$ {item.valor_gasto.toFixed(2)}</Text>
        </Text>

        <Text style={styles.descricao}>{item.descricao}</Text>

        <Pressable 
          style={styles.button}
          onPress={() => {
            navigation.navigate("TelaLancamentoHoras", {
              projetoId: item.id,
              projetoNome: item.nome_projeto
            });
          }}
        >
          <Text style={styles.buttonText}>LANÇAR HORAS</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={["#000060", "#3232B5", "#00007D"]} style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.namepage}>PROJETOS</Text>

        <Ionicons
          name="add-circle"
          size={40}
          color="#00aeff"
          style={{ marginTop: 40 }}
          onPress={() => navigation.navigate("TelaCadastroProjetos")}
        />
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#86EBFF" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={projetos}
          keyExtractor={(item) => item.id}
          renderItem={renderItemProjeto}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum projeto cadastrado no momento.</Text>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  namepage: {
    fontSize: 25,
    color: "#fff",
    marginTop: 40,
    fontWeight: "bold",
  },
  card: {
    width: '100%',
    marginTop: 20,
    backgroundColor: "#0017c9",
    borderRadius: 20,
    elevation: 8,
    overflow: "hidden",
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: 140,
  },
  content: {
    padding: 16,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#86EBFF",
    marginBottom: 2,
  },
  clientText: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.8,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  tempo_estimado: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00cc22",
  },
  tempo_gasto: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff4444",
  },
  descricao: {
    fontSize: 14,
    color: "#BBBBBB",
    lineHeight: 20,
    marginBottom: 15,
    marginTop: 8,
  },
  button: {
    backgroundColor: "#00aeff",
    paddingVertical: 12,
    borderRadius: 12,
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
  }
});
