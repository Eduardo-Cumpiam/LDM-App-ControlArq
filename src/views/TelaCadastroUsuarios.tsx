// TelaCadastroUsuarios.tsx
// Tela para gestão de usuários: liberação, exclusão e edição de perfil.
// O gestor visualiza todos os usuários cadastrados e pode alterar o status,
// além de alterar o nível de acesso e cargo do usuário.
// ====================================================================================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Linking,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import AppCopyrigth from "../components/AppCopyrigth";
import AppHeader from "../components/AppHeader";
import { useBackHandlerLogout } from "../hooks/useBackHandlerLogout";
import { RootStackParamList } from "../navigation/AppNavigator";
import { colors } from "../styles/colors";

import { db } from "../services/firebaseConfig";
import { doc, updateDoc, collection, onSnapshot } from "firebase/firestore";

type TelaCadastroUsuariosNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TelaCadastroUsuarios"
>;

type Props = {
  navigation: TelaCadastroUsuariosNavigationProp;
};

interface Usuario {
  id_usuario: string;
  nome: string;
  email: string;
  nivel_acesso: "gestor" | "supervisor" | "colaborador";
  valor_hora: number; // ✅ Substituído cargo por valor_hora
  telefone?: string; // ✅ Campo de telefone integrado
  status: "pendente" | "autorizado" | "excluido";
}

export default function TelaCadastroUsuarios({ navigation }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [atualizando, setAtualizando] = useState(false);
  const [valoresHoraInput, setValoresHoraInput] = useState<{
    [key: string]: string;
  }>({});

  const { usuarioLogado, perfil, logout } = useAuth();

  useBackHandlerLogout();

  useFocusEffect(
    useCallback(() => {
      if (!usuarioLogado) {
        console.log("Usuário não está logado");
      }
    }, [usuarioLogado]),
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "usuarios"),
      (snapshot) => {
        const lista: Usuario[] = [];
        //const inputsIniciais: { [key: string]: string } = {};

        snapshot.forEach((docSnap) => {
          const dados = docSnap.data();
          const id = docSnap.id;
          const vHora = dados.valor_hora || 0;

          lista.push({
            id_usuario: id,
            nome: dados.nome || "Usuário sem nome",
            email: dados.email || "",
            nivel_acesso: dados.nivel_acesso || "colaborador",
            valor_hora: vHora,
            telefone: dados.telefone || "",
            status: dados.status || "pendente",
          });

          // Atualiza o estado dos inputs apenas se o usuário ainda não começou a editar este campo
          setValoresHoraInput((prev) => ({
            ...prev,
            [id]: prev[id] !== undefined ? prev[id] : vHora.toString(),
          }));
        });

        lista.sort((a, b) => {
          const ordem = { pendente: 0, autorizado: 1, excluido: 2 };
          return ordem[a.status] - ordem[b.status];
        });

        setUsuarios(lista);
      },
      () => {
        Alert.alert("Erro", "Não foi possível carregar os usuários.");
      },
    );

    return unsubscribe;
  }, []);

  const atualizarUsuario = async (
    id: string,
    novoStatus: Usuario["status"],
    novoNivel: Usuario["nivel_acesso"],
    novoValorHoraStr: string,
  ) => {
    try {
      setAtualizando(true);
      const valorFormatado = (novoValorHoraStr || "0").replace(",", ".");
      const novoValorHora = parseFloat(valorFormatado) || 0;

      await updateDoc(doc(db, "usuarios", id), {
        status: novoStatus,
        nivel_acesso: novoNivel,
        valor_hora: novoValorHora,
      });
      Alert.alert("Sucesso", "Usuário atualizado com sucesso.");
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar o usuário.");
    } finally {
      setAtualizando(false);
    }
  };

  const abrirWhatsApp = async (telefone?: string) => {
    if (!telefone) {
      Alert.alert("Atenção", "Este usuário não possui um telefone cadastrado.");
      return;
    }
    // Remove caracteres não numéricos para garantir a URL limpa
    const numeroLimpo = telefone.replace(/\D/g, "");
    const url = `https://wa.me/55${numeroLimpo}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
      }
    } catch {
      Alert.alert("Erro", "Falha ao redirecionar para o WhatsApp.");
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const corStatus = (status: Usuario["status"]) => {
    switch (status) {
      case "autorizado":
        return colors.success;
      case "pendente":
        return colors.warning;
      case "excluido":
        return colors.danger;
      default:
        return colors.textPrimary;
    }
  };

  if (!perfil || perfil.nivel_acesso !== "gestor") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <LinearGradient
          colors={[colors.primarySoft, colors.background]}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 16,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Acesso restrito a gestores.
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
          onVoltar={() => navigation.navigate("TelaGestao")}
        />

        <Text style={styles.title}>Gestão de Usuários</Text>

        {atualizando && (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginVertical: 10 }}
          />
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {usuarios.map((item) => (
            <View key={item.id_usuario} style={styles.card}>
              <View style={styles.headerCardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nome}>{item.nome}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>

                {/* ✅ Botão para acionar o WhatsApp do colaborador */}
                <TouchableOpacity
                  style={styles.whatsappButton}
                  onPress={() => abrirWhatsApp(item.telefone)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-whatsapp" size={26} color="#25D366" />
                </TouchableOpacity>
              </View>

              <Text style={styles.info}>
                Nível de acesso: {item.nivel_acesso.toUpperCase()}
              </Text>

              {/* ✅ Campo customizado para Valor/Hora Técnico */}
              <View style={styles.valorHoraContainer}>
                <Text style={styles.info}>Custo Hora (R$): </Text>
                <TextInput
                  style={styles.valorHoraInput}
                  keyboardType="numeric"
                  value={valoresHoraInput[item.id_usuario] || "0"}
                  onChangeText={(txt) =>
                    setValoresHoraInput((prev) => ({
                      ...prev,
                      [item.id_usuario]: txt,
                    }))
                  }
                  placeholder="0.00"
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <Text style={[styles.status, { color: corStatus(item.status) }]}>
                Status: {item.status.toUpperCase()}
              </Text>

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={item.nivel_acesso}
                  onValueChange={(valor) => {
                    setUsuarios(prev => prev.map(u => u.id_usuario === item.id_usuario ? { ...u, nivel_acesso: valor } : u));
                    atualizarUsuario(
                      item.id_usuario,
                      item.status,
                      valor as Usuario["nivel_acesso"],
                      valoresHoraInput[item.id_usuario]);
                  }}
                  style={styles.picker}
                  dropdownIconColor={colors.primary}
                >
                  <Picker.Item
                    label="Gestor"
                    value="gestor"
                    color={colors.textPrimary}
                  />
                  <Picker.Item
                    label="Supervisor"
                    value="supervisor"
                    color={colors.textPrimary}
                  />
                  <Picker.Item
                    label="Colaborador"
                    value="colaborador"
                    color={colors.textPrimary}
                  />
                </Picker>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.success }]}
                  onPress={() =>
                    atualizarUsuario(
                      item.id_usuario,
                      "autorizado",
                      item.nivel_acesso,
                      valoresHoraInput[item.id_usuario],
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Autorizar / Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.warning }]}
                  onPress={() =>
                    atualizarUsuario(
                      item.id_usuario,
                      "pendente",
                      item.nivel_acesso,
                      valoresHoraInput[item.id_usuario],
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Pendente</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.danger }]}
                  onPress={() =>
                    atualizarUsuario(
                      item.id_usuario,
                      "excluido",
                      item.nivel_acesso,
                      valoresHoraInput[item.id_usuario],
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <AppCopyrigth />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 22,
    color: colors.primary,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "700",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 15,
  },
  headerCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  nome: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  whatsappButton: {
    padding: 6,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  info: { fontSize: 14, color: colors.textPrimary, marginVertical: 2 },
  valorHoraContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  valorHoraInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 6,
    color: colors.textPrimary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    width: 80,
    textAlign: "center",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "bold",
  },
  status: { fontSize: 14, fontWeight: "700", marginVertical: 6 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 6,
    marginVertical: 6,
    backgroundColor: colors.inputBackground,
  },
  picker: { color: colors.textPrimary },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
