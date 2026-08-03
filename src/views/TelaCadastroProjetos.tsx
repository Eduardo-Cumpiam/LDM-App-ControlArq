// TelaCadastroProjetos.tsx
// Tela para cadastro de projetos com controle de escopo e descrição
// Esta tela é acessível apenas para gestores, permitindo a criação de novos projetos vinculados a clientes existentes
//===================================================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { db } from "../services/firebaseConfig";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import AppCopyrigth from "../components/AppCopyrigth";
import AppHeader from "../components/AppHeader";
import { useBackHandlerLogout } from "../hooks/useBackHandlerLogout";
import { RootStackParamList } from "../navigation/AppNavigator";

import { colors } from "../styles/colors";
import { globalStyles } from "../styles/globalStyles";

type TelaCadastroProjetosNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TelaCadastroProjetos"
>;

type Props = {
  navigation: TelaCadastroProjetosNavigationProp;
};

// Paleta fixa de cores hexadecimais para identificação visual dos projetos
const PALETA_CORES = [
  // Vermelhos
  "#FF1744",
  "#ff4444",
  "#FF4500",
  "#FF6D00",
  // Laranjas
  "#FF9100",
  "#FF8C00",
  "#FFAB00",
  // Amarelos
  "#FFEA00",
  "#FFD700",
  "#E0AA3E",
  // Verdes
  "#ADFF2F",
  "#76FF03",
  "#00FF7F",
  "#00E676",
  "#00cc22",
  "#69F0AE",
  "#00FA9A",
  "#00BFA5",
  // Azuis
  "#00BCD4",
  "#18FFFF",
  "#86EBFF",
  "#2979FF",
  "#00aeff",
  "#3D5AFE",
  // Violetas/Roxos
  "#651FFF",
  "#9D00FF",
  "#D500F9",
  "#B388FF",
  // Rosas
  "#FF4081",
  "#F50057",
  "#FF69B4",
  "#FF1493",
  "#FF007F",
  // Neutros
  "#C0C0C0",
  "#FFFFFF",
  "#000000",
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
  const [corSelecionada, setCorSelecionada] = useState(PALETA_CORES[0]);
  const [carregando, setCarregando] = useState(false);

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

  if (!perfil || perfil.nivel_acesso !== "gestor") {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.restrictedContainer}>
          <Text style={styles.restrictedText}>
            Apenas gestores podem cadastrar projetos.
          </Text>
        </View>
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
    if (
      !nomeProjeto ||
      !clienteSelecionado ||
      !dataInicio ||
      !dataTermino ||
      !horasOrcadas ||
      !valorOrcamento ||
      !descricao
    ) {
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
    <SafeAreaView style={globalStyles.container}>
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

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.contentWrapper}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={globalStyles.title}>Novo Projeto</Text>
            <Text style={[globalStyles.description, styles.description]}>
              Insira as especificações do escopo para iniciar o monitoramento.
            </Text>

            <View style={styles.formSection}>
              <Text style={globalStyles.label}>Nome do Projeto:</Text>
              <TextInput
                style={globalStyles.input}
                value={nomeProjeto}
                onChangeText={setNomeProjeto}
                placeholder="Ex: Reforma Residencial Univem"
                placeholderTextColor={colors.textLight}
              />

              <Text style={globalStyles.label}>
                Cor Identificadora do Projeto:
              </Text>
              <View style={styles.colorPaletteContainer}>
                <FlatList
                  data={PALETA_CORES}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item}
                  contentContainerStyle={{
                    paddingVertical: 5,
                    paddingHorizontal: 2,
                  }}
                  renderItem={({ item: cor }) => (
                    <TouchableOpacity
                      onPress={() => setCorSelecionada(cor)}
                      activeOpacity={0.8}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: cor },
                        corSelecionada === cor && styles.colorCircleSelected,
                      ]}
                    />
                  )}
                />
              </View>

              <Text style={globalStyles.label}>Cliente Associado:</Text>
              <View style={globalStyles.pickerWrapper}>
                <Picker
                  selectedValue={clienteSelecionado}
                  onValueChange={setClienteSelecionado}
                  style={globalStyles.picker}
                  dropdownIconColor={colors.primary}
                >
                  <Picker.Item
                    label="Selecione um cliente"
                    value=""
                    color={colors.textLight}
                  />
                  {clientes.map((c) => (
                    <Picker.Item
                      key={c.id}
                      label={c.nome}
                      value={c.id}
                      color={colors.textPrimary}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={globalStyles.label}>Data Início:</Text>
              <TouchableOpacity
                onPress={() => setShowInicio(true)}
                style={styles.dateSelector}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dateText,
                    !dataInicio && { color: colors.textLight },
                  ]}
                >
                  {dataInicio
                    ? dataInicio.toLocaleDateString("pt-BR")
                    : "Selecione a data"}
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

              <Text style={globalStyles.label}>Data Término:</Text>
              <TouchableOpacity
                onPress={() => setShowTermino(true)}
                style={styles.dateSelector}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dateText,
                    !dataTermino && { color: colors.textLight },
                  ]}
                >
                  {dataTermino
                    ? dataTermino.toLocaleDateString("pt-BR")
                    : "Selecione a data"}
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

              <Text style={globalStyles.label}>Horas Orçadas:</Text>
              <TextInput
                style={globalStyles.input}
                value={horasOrcadas}
                onChangeText={setHorasOrcadas}
                placeholder="Ex: 120"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
              />

              <Text style={globalStyles.label}>
                Valor Total de Orçamento (R$):
              </Text>
              <TextInput
                style={globalStyles.input}
                value={valorOrcamento}
                onChangeText={setValorOrcamento}
                placeholder="Ex: 50000"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
              />

              <Text style={globalStyles.label}>Descrição / Escopo:</Text>
              <TextInput
                style={[globalStyles.input, styles.textArea]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Detalhamento do escopo..."
                placeholderTextColor={colors.textLight}
                multiline
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
                  onPress={handleSalvarProjeto}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>Salvar Projeto</Text>
                </TouchableOpacity>
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
  container: { 
    flex: 1 
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  contentWrapper: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 10,
  },

  headerSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
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

  formSection: {
    width: "100%",
    marginTop: 24,
    justifyContent: "center",
  },

  title: {
    fontSize: 24,
    color: colors.primarySoft,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 3,
  },

  description: {
    fontSize: 13,
    color: colors.primaryLight,
    textAlign: "center",
  },

  label: {
    fontSize: 13,
    color: colors.white,
    marginBottom: 6,
    fontWeight: "500",
    marginTop: 2,
  },

  input: {
    height: 42,
    borderColor: colors.white,
    borderWidth: 2,
    marginBottom: 12,
    color: colors.white,
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.textPrimary,
    justifyContent: "center",
  },

  textArea: {
    height: 70,
    paddingTop: 8,
    textAlignVertical: "top",
  },

  pickerWrapper: {
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: colors.textPrimary,
  },

  picker: {
    color: colors.white,
  },

  colorPaletteContainer: {
    marginBottom: 16,
    height: 48,
    justifyContent: "center",
  },

  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 12,
  },

  colorCircleSelected: {
    borderColor: colors.primary,
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },

  dateSelector: {
    height: 48,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  dateText: {
    fontSize: 15,
    color: colors.textPrimary,
  },

  buttonContainer: {
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 15,
  },

  saveButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 15,
  },

  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
