// TelaCadastroClientes.tsx
// Tela para cadastro de clientes, acessível apenas para usuários com perfil de Gestor
// Esta tela é protegida pela navegação condicional no AppNavigator, garantindo que apenas gestores possam acessá-la. O formulário de cadastro inclui campos para nome do cliente, contato e endereço, e utiliza o Firebase Firestore para armazenar os dados dos clientes cadastrados.
//===================================================================================================================

import React, { useState } from "react";
import { Text, TextInput, Button, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "../services/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";

export default function TelaCadastroClientes() {
  
  const [nome, setNome] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<"fisica" | "juridica" | "">("");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [carregando, setCarregando] = useState(false);

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

    try {
      setCarregando(true);

      await addDoc(collection(db, "clientes"), {
        nome,
        tipo_pessoa: tipoPessoa,
        cpf: tipoPessoa === "fisica" ? cpf : null,
        cnpj: tipoPessoa === "juridica" ? cnpj : null,
        endereco,
        data_cadastro: new Date().toISOString(),
        status: "Ativo",
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
    <LinearGradient colors={["#000060", "#3232B5", "#00007D"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.contentWrapper}>
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

            <Text style={styles.label}>Tipo de Pessoa:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={tipoPessoa}
                onValueChange={(itemValue) => setTipoPessoa(itemValue)}
                style={styles.picker}
              >
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

            <View style={styles.buttonContainer}>
              <Button title="Salvar Cliente" color="#00849e" onPress={handleSalvarCliente} disabled={carregando} />
            </View>
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
  container: { 
    flex: 1 
  },
  contentWrapper: { 
    flex: 1, 
    paddingHorizontal: 25, 
    justifyContent: "space-between", 
    paddingVertical: 10 
  },
  headerSection: { 
    alignItems: "center", 
    flex: 0.5, 
    justifyContent: "center" 
  },
  formSection: { 
    width: "100%", 
    flex: 4, 
    justifyContent: "center" 
  },
  footerSection: { 
    alignItems: "center", 
    justifyContent: "flex-end", 
    paddingBottom: 5 
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
    marginBottom: 4, 
    fontWeight: "500" 
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
  pickerWrapper: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 6,
    marginBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  picker: { 
    color: "#fff" 
  },
  buttonContainer: { 
    borderRadius: 6, 
    overflow: "hidden", 
    marginTop: 5 
  },
  footerText: { 
    fontSize: 11, 
    color: "#86EBFF", 
    opacity: 0.5 
  },
});