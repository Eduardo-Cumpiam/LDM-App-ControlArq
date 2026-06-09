// TelaCadastroProjetos.tsx
// Tela para cadastro de projetos com controle de escopo e descrição
//===================================================================================

import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { db } from "../services/firebaseConfig"; 
import { collection, addDoc } from "firebase/firestore";

export default function TelaCadastroProjetos() {
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [fkCliente, setFkCliente] = useState(""); 
  const [dataInicio, setDataInicio] = useState("");
  const [dataTermino, setDataTermino] = useState("");
  const [horasOrcadas, setHorasOrcadas] = useState("");
  const [descricao, setDescricao] = useState(""); // Novo estado para a descrição do projeto
  
  const [carregando, setCarregando] = useState(false);

  const handleSalvarProjeto = async () => {
    // Validação dos campos obrigatórios
    if (!nomeProjeto || !fkCliente || !dataInicio || !dataTermino || !horasOrcadas || !descricao) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos do projeto.");
      return;
    }

    try {
      setCarregando(true);

      // Salva os dados no Firestore alinhado com a sua nova estrutura de negócio
      await addDoc(collection(db, "projetos"), {
        nome_projeto: nomeProjeto,
        fk_cliente: fkCliente, 
        horas_orcadas: parseInt(horasOrcadas, 10) || 0,
        descricao: descricao, // Salva como string na nuvem
        
        // Campos de controle dinâmico do ControlArq
        data_inicio: dataInicio,
        data_termino: dataTermino,
        horas_gastas: 0, 
        valor_gasto: 0,  
        status: "Ativo", 
        data_criacao: new Date().toISOString()
      });

      Alert.alert("Sucesso!", "Projeto cadastrado com sucesso no ControlArq!");
      
      // Limpa todos os campos para o próximo cadastro
      setNomeProjeto("");
      setFkCliente("");
      setDataInicio("");
      setDataTermino("");
      setHorasOrcadas("");
      setDescricao("");

    } catch (error: any) {
      Alert.alert("Erro ao salvar", "Não foi possível salvar o projeto: " + error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <LinearGradient
      colors={['#000060', '#3232B5', '#00007D']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.contentWrapper}
        >
          
          <View style={styles.headerSection}>
            <Text style={styles.title}>Novo Projeto</Text>
            <Text style={styles.description}>
              Insira as especificações do escopo para iniciar o monitoramento.
            </Text>
          </View>

          <View style={styles.formSection}>
            
            <Text style={styles.label}>NOME DO PROJETO:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Reforma Residencial Univem"
              placeholderTextColor="#999"
              value={nomeProjeto}
              onChangeText={setNomeProjeto}
            />

            <Text style={styles.label}>CLIENTE ASSOCIADO (OU ID):</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Nome do cliente ou ID"
              placeholderTextColor="#999"
              value={fkCliente}
              onChangeText={setFkCliente}
            />

            {/* Linha horizontal para as datas */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>DATA INÍCIO:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="31/05/2026"
                  placeholderTextColor="#999"
                  value={dataInicio}
                  onChangeText={setDataInicio}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>DATA TÉRMINO:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="20/12/2026"
                  placeholderTextColor="#999"
                  value={dataTermino}
                  onChangeText={setDataTermino}
                />
              </View>
            </View>

            <Text style={styles.label}>HORAS ORÇADAS:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 120"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={horasOrcadas}
              onChangeText={setHorasOrcadas}
            />

            <Text style={styles.label}>DESCRIÇÃO / ESCOPO DO PROJETO:</Text>
            <TextInput
              style={[styles.input, styles.textArea]} // Aplica estilo estendido de caixa de texto maior
              placeholder="Ex: Detalhamento de interiores, paginação de piso e gesso..."
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={3}
              value={descricao}
              onChangeText={setDescricao}
            />

            {carregando ? (
              <ActivityIndicator size="large" color="#86EBFF" style={{ marginVertical: 10 }} />
            ) : (
              <View style={styles.buttonContainer}>
                <Button
                  title="Salvar Projeto"
                  color="#00849e"
                  onPress={handleSalvarProjeto}
                />
              </View>
            )}

          </View>

          <View style={styles.footerSection}>
            <Text style={styles.copyright}>ControlARQ 2026 &copy; All rights reserved.</Text>
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
  input: { height: 42, borderColor: '#fff', borderWidth: 2, marginBottom: 12, color: "#fff", borderRadius: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  textArea: {
    height: 70, // Dá uma altura extra para o usuário conseguir ver o bloco de texto digitado
    paddingTop: 8,
    textAlignVertical: 'top', // Garante que o texto comece no topo esquerdo do campo no Android
  },
  row: { flexDirection: "row", width: "100%" },
  buttonContainer: { borderRadius: 6, overflow: "hidden", marginTop: 5 },
  copyright: { fontSize: 11, color: "#86EBFF", opacity: 0.5 }
});