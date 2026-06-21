// TelaCadastroClientes.tsx
// Tela para cadastro de clientes, acessível apenas para usuários com perfil de Gestor
// Esta tela é protegida pela navegação condicional no AppNavigator, garantindo que apenas gestores possam acessá-la. O formulário de cadastro inclui campos para nome do cliente, contato e endereço, e utiliza o Firebase Firestore para armazenar os dados dos clientes cadastrados.
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
import { db } from "../services/firebaseConfig";
import { collection, addDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import AppCopyrigth from "../components/AppCopyrigth";
import AppHeader from "../components/AppHeader";
import { useBackHandlerLogout } from "../hooks/useBackHandlerLogout";
import { RootStackParamList } from "../navigation/AppNavigator";

type TelaCadastroClientesNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaCadastroClientes">;

type Props = {
  navigation: TelaCadastroClientesNavigationProp;
};

interface Cliente {
  id: string;
  nome: string;
}

export default function TelaCadastroClientes({ navigation }: Props) {
  const { usuarioLogado, perfil, logout } = useAuth();
  const [nome, setNome] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<"fisica" | "juridica" | "">("");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sugestoes, setSugestoes] = useState<Cliente[]>([]);

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

  // Bloqueio de acesso para não-gestores
  if (!perfil || perfil.nivel_acesso !== "gestor") {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#fff", fontSize: 16 }}>
          Acesso restrito a gestores.
        </Text>
      </SafeAreaView>
    );
  }

  // Carregar clientes uma vez e manter em cache
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "clientes"), (snapshot) => {
      const lista: Cliente[] = [];
      snapshot.forEach((docSnap) => {
        const dados = docSnap.data();
        lista.push({ id: docSnap.id, nome: dados.nome || "" });
      });
      setClientes(lista);
    });
    return unsubscribe;
  }, []);

  // Filtrar sugestões localmente
  useEffect(() => {
    if (nome.trim().length > 0) {
      const filtrados = clientes.filter((c) =>
        c.nome.toLowerCase().includes(nome.toLowerCase())
      );
      setSugestoes(filtrados);
    } else {
      setSugestoes([]);
    }
  }, [nome, clientes]);

  const handleSalvarCliente = async () => {
    if (!nome || !tipoPessoa || !endereco) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    if (tipoPessoa === "fisica" && !cpf) {
      Alert.alert("Atenção", "Informe o CPF.");
      return;
    }

    if (tipoPessoa === "juridica" && !cnpj) {
      Alert.alert("Atenção", "Informe o CNPJ.");
      return;
    }

    // Validação final contra duplicidade
    const existe = clientes.some(
      (c) => c.nome.toLowerCase() === nome.toLowerCase()
    );
    if (existe) {
      Alert.alert("Atenção", "Já existe um cliente com este nome.");
      return;
    }

    try {
      setCarregando(true);

      await addDoc(collection(db, "clientes"), {
        nome,
        tipo_pessoa: tipoPessoa,
        cpf: tipoPessoa === "fisica" ? cpf : null,
        cnpj: tipoPessoa === "juridica" ? cnpj : null,
        endereco,
        data_cadastro: Timestamp.fromDate(new Date()),
        status: "ativo",
      });

      Alert.alert("Sucesso!", "Cliente cadastrado com sucesso!");
      setNome("");
      setTipoPessoa("");
      setCpf("");
      setCnpj("");
      setEndereco("");
    } catch (error: any) {
      Alert.alert("Erro ao salvar", error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#000060", "#3232B5", "#00007D"]} style={styles.container}>
        <AppHeader
          nomeUsuario={perfil?.nome}
          onLogout={handleLogout}
          mostrarVoltar={true}
          onVoltar={() => {
            navigation.navigate("TelaGestao");
          }}
        />

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.contentWrapper}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.headerSection}>
              <Text style={styles.title}>Novo Cliente</Text>
              <Text style={styles.description}>Cadastre os dados do cliente para vincular aos projetos.</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Nome:</Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex: João da Silva / Construtora XYZ"
                placeholderTextColor="#999"
              />

              {/* Sugestões de clientes já cadastrados */}
              {sugestoes.length > 0 && (
                <View style={styles.sugestoesWrapper}>
                  {sugestoes.map((c) => (
                    <Text key={c.id} style={styles.sugestao}>
                      {c.nome}
                    </Text>
                  ))}
                </View>
              )}

              <Text style={styles.label}>Tipo de Pessoa:</Text>
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={tipoPessoa} onValueChange={setTipoPessoa} style={styles.picker}>
                  <Picker.Item label="Selecione" value="" />
                  <Picker.Item label="Pessoa Física" value="fisica" />
                  <Picker.Item label="Pessoa Jurídica" value="juridica" />
                </Picker>
              </View>

              {tipoPessoa === "fisica" && (
                <>
                  <Text style={styles.label}>CPF:</Text>
                  <TextInput
                    style={styles.input}
                    value={cpf}
                    onChangeText={setCpf}
                    placeholder="000.000.000-00"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </>
              )}

              {tipoPessoa === "juridica" && (
                <>
                  <Text style={styles.label}>CNPJ:</Text>
                  <TextInput
                    style={styles.input}
                    value={cnpj}
                    onChangeText={setCnpj}
                    placeholder="00.000.000/0000-00"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </>
              )}

              <Text style={styles.label}>Endereço:</Text>
              <TextInput
                style={styles.input}
                value={endereco}
                onChangeText={setEndereco}
                placeholder="Rua, número, bairro, cidade"
                placeholderTextColor="#999"
              />

              {carregando ? (
                <ActivityIndicator size="large" color="#86EBFF" style={{ marginVertical: 10 }} />
              ) : (
                <View style={styles.buttonContainer}>
                  <Button title="Salvar Cliente" color="#00849e" onPress={handleSalvarCliente} />
                </View>
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
  contentWrapper: { flex: 1, paddingHorizontal: 25, justifyContent: "space-between", paddingVertical: 10 },
  scrollContent: { paddingBottom: 20 },
  headerSection: { alignItems: "center", marginBottom: 15 },
  formSection: { width: "100%", flex: 1 },

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
  pickerWrapper: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 6,
    marginBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  picker: { color: "#fff" },
  buttonContainer: { borderRadius: 6, overflow: "hidden", marginTop: 5 },
  sugestoesWrapper: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "#86EBFF",
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  sugestao: {
    fontSize: 13,
    color: "#86EBFF",
    paddingVertical: 2,
  },
});
