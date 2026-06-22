// TelaCadastroProjetos.tsx
// Tela para cadastro de projetos com controle de escopo e descrição
// Esta tela é acessível apenas para gestores, permitindo a criação de novos projetos vinculados a clientes existentes
//===================================================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  TouchableOpacity,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { db } from "../services/firebaseConfig";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FlatList } from "react-native";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import AppCopyrigth from "../components/AppCopyrigth";
import AppHeader from "../components/AppHeader";
import { useBackHandlerLogout } from "../hooks/useBackHandlerLogout";
import { RootStackParamList } from "../navigation/AppNavigator";

type TelaCadastroProjetosNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaCadastroProjetos">;

type Props = {
  navigation: TelaCadastroProjetosNavigationProp;
};

// Paleta fixa de cores hexadecimais para identificação visual dos projetos
const PALETA_CORES = [
  "#00aeff", "#00cc22", "#FF8C00", "#ff4444", "#86EBFF", "#E0AA3E", 
  "#FF007F", "#9D00FF", "#00FF7F", "#FFD700", "#FF69B4", "#00FA9A", 
  "#FF4500", "#ADFF2F", "#C0C0C0", "#FF1493", "#FFFFFF", "#000000",
];

export default function TelaCadastroProjetos({ navigation }: Props) {
  const { usuarioLogado, perfil, logout } = useAuth();

  const [nomeProjeto, setNomeProjeto] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([]);
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataTermino, setDataTermino] = useState<Date | null>(null);
  const [showInicio, setShowInicio] = useState(false);
  const [showTermino, setShowTermino] = useState(false);
  const [horasOrcadas, setHorasOrcadas] = useState("");
  const [valorOrcamento, setValorOrcamento] = useState("");
  const [descricao, setDescricao] = useState("");
  const [corSelecionada, setCorSelecionada] = useState(PALETA_CORES[0]); // ✅ Estado para gerenciar a cor
  const [carregando, setCarregando] = useState(false);

  useBackHandlerLogout();

  useFocusEffect(
    useCallback(() => {
      if (!usuarioLogado) {
        console.log('Usuário não está logado');
      }
    }, [usuarioLogado])
  );

  const handleLogout = async () => {
    await logout();
  };

  if (!perfil || perfil.nivel_acesso !== "gestor") {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000060" }}>
        <Text style={{ color: "#fff", fontSize: 16 }}>
          Apenas gestores podem cadastrar projetos.
        </Text>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clientes"));
        const lista: { id: string; nome: string }[] = [];
        querySnapshot.forEach((docSnap) => {
          const dados = docSnap.data();
          lista.push({ id: docSnap.id, nome: dados.nome || "Sem nome" });
        });
        setClientes(lista);
      } catch {
        Alert.alert("Erro", "Não foi possível carregar os clientes.");
      }
    };
    carregarClientes();
  }, []);

  const handleSalvarProjeto = async () => {
    if (!nomeProjeto || !clienteSelecionado || !dataInicio || !dataTermino || !horasOrcadas || !valorOrcamento || !descricao) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    try {
      setCarregando(true);
      const clienteObj = clientes.find((c) => c.id === clienteSelecionado);

      await addDoc(collection(db, "projetos"), {
        nome_projeto: nomeProjeto,
        fk_cliente: clienteSelecionado,
        nome_cliente: clienteObj?.nome || "Sem nome",
        gestor_id: usuarioLogado?.uid,
        horas_orcadas: parseInt(horasOrcadas, 10),
        valor_orcamento: parseFloat(valorOrcamento),
        descricao,
        cor_projeto: corSelecionada,
        data_inicio: Timestamp.fromDate(dataInicio),
        data_termino_previsto: Timestamp.fromDate(dataTermino),
        horas_gastas: 0,
        valor_gasto: 0,
        percentual_conclusao: 0,
        status: "ativo",
        imagem_capa: "", 
        data_criacao: Timestamp.fromDate(new Date()),
      });

      Alert.alert("Sucesso!", "Projeto cadastrado com sucesso!");
      setNomeProjeto("");
      setClienteSelecionado("");
      setDataInicio(null);
      setDataTermino(null);
      setHorasOrcadas("");
      setValorOrcamento("");
      setDescricao("");
      setCorSelecionada(PALETA_CORES[0]); // ✅ Reseta para a cor inicial
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
          onVoltar={() => navigation.navigate("TelaGestao")}
        />

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.contentWrapper}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.headerSection}>
              <Text style={styles.title}>Novo Projeto</Text>
              <Text style={styles.description}>Insira as especificações do escopo para iniciar o monitoramento.</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Nome do Projeto:</Text>
              <TextInput 
                style={styles.input} 
                value={nomeProjeto} 
                onChangeText={setNomeProjeto} 
                placeholder="Ex: Reforma Residencial Univem" 
                placeholderTextColor="#999" 
              />

<Text style={styles.label}>Cor Identificadora do Projeto:</Text>
<View style={styles.colorPaletteContainer}>
  <FlatList
    data={PALETA_CORES}
    horizontal
    showsHorizontalScrollIndicator={false}
    keyExtractor={(item) => item}
    contentContainerStyle={{ paddingVertical: 5, paddingHorizontal: 2 }}
    renderItem={({ item: cor }) => (
      <TouchableOpacity
        onPress={() => setCorSelecionada(cor)}
        style={[
          styles.colorCircle,
          { backgroundColor: cor },
          corSelecionada === cor && styles.colorCircleSelected
        ]}
      />
    )}
  />
</View>

              <Text style={styles.label}>Cliente Associado:</Text>
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={clienteSelecionado} onValueChange={setClienteSelecionado} style={styles.picker}>
                  <Picker.Item label="Selecione um cliente" value="" />
                  {clientes.map((c) => (
                    <Picker.Item key={c.id} label={c.nome} value={c.id} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Data Início:</Text>
              <TouchableOpacity onPress={() => setShowInicio(true)} style={styles.input}>
                <Text style={{ color: "#fff" }}>
                  {dataInicio ? dataInicio.toLocaleDateString("pt-BR") : "Selecione a data"}
                </Text>
              </TouchableOpacity>
              {showInicio && (
                <DateTimePicker 
                  value={dataInicio || new Date()} 
                  mode="date" 
                  display="default" 
                  onChange={(_, date) => { 
                    setShowInicio(false); 
                    if (date) setDataInicio(date); 
                  }} 
                />
              )}

              <Text style={styles.label}>Data Término:</Text>
              <TouchableOpacity onPress={() => setShowTermino(true)} style={styles.input}>
                <Text style={{ color: "#fff" }}>
                  {dataTermino ? dataTermino.toLocaleDateString("pt-BR") : "Selecione a data"}
                </Text>
              </TouchableOpacity>
              {showTermino && (
                <DateTimePicker 
                  value={dataTermino || new Date()} 
                  mode="date" 
                  display="default" 
                  onChange={(_, date) => { 
                    setShowTermino(false); 
                    if (date) setDataTermino(date); 
                  }} 
                />
              )}

              <Text style={styles.label}>Horas Orçadas:</Text>
              <TextInput 
                style={styles.input} 
                value={horasOrcadas} 
                onChangeText={setHorasOrcadas} 
                placeholder="Ex: 120" 
                placeholderTextColor="#999" 
                keyboardType="numeric" 
              />

              <Text style={styles.label}>Valor Total de Orçamento (R$):</Text>
              <TextInput 
                style={styles.input} 
                value={valorOrcamento} 
                onChangeText={setValorOrcamento} 
                placeholder="Ex: 50000" 
                placeholderTextColor="#999" 
                keyboardType="numeric" 
              />

              <Text style={styles.label}>Descrição / Escopo:</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={descricao} 
                onChangeText={setDescricao} 
                placeholder="Detalhamento do escopo..." 
                placeholderTextColor="#999" 
                multiline 
              />

              {carregando ? (
                <ActivityIndicator size="large" color="#86EBFF" style={{ marginVertical: 10 }} />
              ) : (
                <View style={styles.buttonContainer}>
                  <Button title="Salvar Projeto" color="#00849e" onPress={handleSalvarProjeto} />
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <AppCopyrigth />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 10
  },
  headerSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  formSection: {
    width: "100%",
    justifyContent: "center"
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 3
  },
  description: {
    fontSize: 13,
    color: "#86EBFF",
    textAlign: "center"
  },
  label: {
    fontSize: 13,
    color: "#fff",
    marginBottom: 6,
    fontWeight: "500",
    marginTop: 2
  },
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
  textArea: {
    height: 70,
    paddingTop: 8,
    textAlignVertical: "top"
  },
  pickerWrapper: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  picker: {
    color: "#fff"
  },
colorPaletteContainer: {
    marginBottom: 16,
    height: 45, // Garante que a lista não seja cortada
    justifyContent: "center",
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginRight: 12, // Espaço entre as cores para o deslize lateral
  },
  colorCircleSelected: {
    borderColor: "#FFF",
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
  buttonContainer: {
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 15
  },
});
