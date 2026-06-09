// TelaCadastroUsuarios.tsx
// Tela para gestão de usuários: liberação e exclusão.
// O gestor visualiza todos os usuários cadastrados e pode alterar o status.
// ====================================================================================================================

import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  SafeAreaView,
  View,
  Alert,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Firebase
import { db } from "../services/firebaseConfig";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";

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

interface Usuario {
  id_usuario: string;
  email: string;
  nivel_acesso: string;
  status: "pendente" | "autorizado" | "excluído";
}

export default function TelaCadastroUsuarios({ navigation }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Carregar lista de usuários
  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        const lista: Usuario[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as Usuario;
          lista.push(data);
        });
        setUsuarios(lista);
      } catch (error: any) {
        Alert.alert("Erro", "Não foi possível carregar os usuários.");
      }
    };
    carregarUsuarios();
  }, []);

  const atualizarStatus = async (id: string, novoStatus: "pendente" | "autorizado" | "excluído") => {
    try {
      await updateDoc(doc(db, "usuarios", id), { status: novoStatus });
      Alert.alert("Sucesso", `Usuário atualizado para ${novoStatus}.`);
      setUsuarios((prev) =>
        prev.map((u) => (u.id_usuario === id ? { ...u, status: novoStatus } : u))
      );
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível atualizar o status.");
    }
  };

  const renderUsuario = ({ item }: { item: Usuario }) => (
    <View style={styles.card}>
      <Text style={styles.email}>{item.email}</Text>
      <Text style={styles.info}>Cargo: {item.nivel_acesso}</Text>
      <Text style={styles.info}>Status: {item.status}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#00849e" }]}
          onPress={() => atualizarStatus(item.id_usuario, "autorizado")}
        >
          <Text style={styles.buttonText}>Autorizar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#ff9800" }]}
          onPress={() => atualizarStatus(item.id_usuario, "pendente")}
        >
          <Text style={styles.buttonText}>Pendente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#e53935" }]}
          onPress={() => atualizarStatus(item.id_usuario, "excluído")}
        >
          <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={["#000060", "#3232B5", "#00007D"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={styles.title}>Gestão de Usuários</Text>
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id_usuario}
          renderItem={renderUsuario}
          contentContainerStyle={{ padding: 20 }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 22,
    color: "#fff",
    textAlign: "center",
    marginVertical: 15,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  email: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  info: {
    fontSize: 14,
    color: "#86EBFF",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
