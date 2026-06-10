// TelaCadastroUsuarios.tsx
// Tela para gestão de usuários: liberação, exclusão e edição de perfil.
// O gestor visualiza todos os usuários cadastrados e pode alterar o status,
// além de alterar o nível de acesso e cargo do usuário.
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
import { Picker } from "@react-native-picker/picker";

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
  cargo?: string;
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
          const { id_usuario, ...dataWithoutId } = data;
          lista.push({ id_usuario: docSnap.id, ...dataWithoutId });
        });
        setUsuarios(lista);
      } catch (error: any) {
        Alert.alert("Erro", "Não foi possível carregar os usuários.");
      }
    };
    carregarUsuarios();
  }, []);

  const atualizarUsuario = async (
    id: string,
    novoStatus: "pendente" | "autorizado" | "excluído",
    novoNivel: string,
    novoCargo: string
  ) => {
    try {
      await updateDoc(doc(db, "usuarios", id), {
        status: novoStatus,
        nivel_acesso: novoNivel,
        cargo: novoCargo,
      });
      Alert.alert("Sucesso", "Usuário atualizado com sucesso.");
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id_usuario === id
            ? { ...u, status: novoStatus, nivel_acesso: novoNivel, cargo: novoCargo }
            : u
        )
      );
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível atualizar o usuário.");
    }
  };

  const renderUsuario = ({ item }: { item: Usuario }) => (
    <View style={styles.card}>
      <Text style={styles.email}>{item.email}</Text>
      <Text style={styles.info}>Nível de acesso: {item.nivel_acesso}</Text>
      <Text style={styles.info}>Cargo: {item.cargo || "Não definido"}</Text>
      <Text style={styles.info}>Status: {item.status}</Text>

      {/* Picker para nível de acesso */}
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={item.nivel_acesso}
          onValueChange={(valor) =>
            atualizarUsuario(item.id_usuario, item.status, valor, item.cargo || "")
          }
          style={styles.picker}
        >
          <Picker.Item label="Gestor" value="gestor" />
          <Picker.Item label="Supervisor" value="supervisor" />
          <Picker.Item label="Colaborador" value="colaborador" />
        </Picker>
      </View>

      {/* Picker para cargo */}
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={item.cargo}
          onValueChange={(valor) =>
            atualizarUsuario(item.id_usuario, item.status, item.nivel_acesso, valor)
          }
          style={styles.picker}
        >
          <Picker.Item label="Sênior" value="Sênior" />
          <Picker.Item label="Pleno" value="Pleno" />
          <Picker.Item label="Júnior" value="Júnior" />
          <Picker.Item label="Estagiário" value="Estagiário" />
        </Picker>
      </View>

      {/* Botões de status */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#00849e" }]}
          onPress={() =>
            atualizarUsuario(item.id_usuario, "autorizado", item.nivel_acesso, item.cargo || "")
          }
        >
          <Text style={styles.buttonText}>Autorizar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#ff9800" }]}
          onPress={() =>
            atualizarUsuario(item.id_usuario, "pendente", item.nivel_acesso, item.cargo || "")
          }
        >
          <Text style={styles.buttonText}>Pendente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#e53935" }]}
          onPress={() =>
            atualizarUsuario(item.id_usuario, "excluído", item.nivel_acesso, item.cargo || "")
          }
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
    borderWidth: 1,
    borderColor: "#fff",
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
  pickerWrapper: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 6,
    marginVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  picker: { color: "#fff" },
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
