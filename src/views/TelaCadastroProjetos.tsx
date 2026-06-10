// TelaCadastroProjetos.tsx
// Tela para cadastro de projetos com controle de escopo e descrição
//===================================================================================

import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "../services/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AuthContext } from "../context/AuthContext"; // exemplo de contexto

export default function TelaCadastroProjetos() {
  const { usuarioLogado, perfil } = useContext(AuthContext); // usuário logado
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
  const [carregando, setCarregando] = useState(false);

  // Validação de perfil: apenas gestor pode acessar
  if (!perfil || perfil.nivel_acesso !== "gestor") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#fff", fontSize: 16 }}>
          Apenas gestores podem cadastrar projetos.
        </Text>
      </View>
    );
  }

  // Carregar clientes do Firestore
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
      } catch (error: any) {
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

      await addDoc(collection(db, "projetos"), {
        nome_projeto: nomeProjeto,
        fk_cliente: clienteSelecionado,
        gestor_id: usuarioLogado?.uid, // quem cadastrou
        horas_orcadas: parseInt(horasOrcadas, 10) || 0,
        valor_orcamento: parseFloat(valorOrcamento) || 0,
        descricao,
        data_inicio: dataInicio.toISOString(),
        data_termino: dataTermino.toISOString(),
        horas_gastas: 0,
        valor_gasto: 0,
        status: "Ativo",
        data_criacao: new Date().toISOString(),
      });

      Alert.alert("Sucesso!", "Projeto cadastrado com sucesso!");
      setNomeProjeto("");
      setClienteSelecionado("");
      setDataInicio(null);
      setDataTermino(null);
      setHorasOrcadas("");
      setValorOrcamento("");
      setDescricao("");
    } catch (error: any) {
      Alert.alert("Erro ao salvar", error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <LinearGradient colors={["#000060", "#3232B5", "#00007D"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.contentWrapper}>
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

            <Text style={styles.label}>Cliente Associado:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={clienteSelecionado}
                onValueChange={(itemValue) => setClienteSelecionado(itemValue)}
                style={styles.picker}
              >
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

          <View style={styles.footerSection}>
            <Text style={styles.footerText}>ControlARQ 2026 © All rights reserved.</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: { flex: 1, paddingHorizontal: 25, justifyContent: "space-between", paddingVertical: 10 },
  headerSection: { alignItems: "center", flex: 0.5, justifyContent: "center" },
  formSection: { width: "100%", flex: 4, justifyContent: "center" },
  footerSection: { alignItems: "center", justifyContent: "flex-end", paddingBottom: 5 },
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
  textArea: { height: 70, paddingTop: 8, textAlignVertical: "top" },
  pickerWrapper: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 6,
    marginBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  picker: { color: "#fff" },
  buttonContainer: { borderRadius: 6, overflow: "hidden", marginTop: 5 },
  footerText: { fontSize: 11, color: "#86EBFF", opacity: 0.5 },
});
