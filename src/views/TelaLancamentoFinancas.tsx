// TelaLancamentoFinancas.tsx
// Arquivo de tela para o gestor lançar faturamentos, despesas e impostos vinculados a um projeto ativo.
// ====================================================================================================================

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";
import AppCopyrigth from "../components/AppCopyrigth";
import SeletorDataHora from "../components/SeletorDataHora";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useLancamentoFinancas, TipoLancamento, } from "../hooks/useLancamentoFinancas";

type TelaFinancasNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TelaLancamentoFinancas"
>;

type Props = {
  navigation: TelaFinancasNavigationProp;
};

export default function TelaLancamentoFinancas({ navigation }: Props) {
  const { perfil, logout } = useAuth();
  const [modalProjetosVisivel, setModalProjetosVisivel] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const {
    projetos,
    projetoSelecionado,
    setProjetoSelecionado,
    tipo,
    setTipo,
    valor,
    setValor,
    data,
    setData,
    descricao,
    setDescricao,
    carregando,
    salvarLancamento,
  } = useLancamentoFinancas(navigation);

  // Encontra o objeto do projeto selecionado para exibir o nome no botão do "Picker"
  const projetoAtual = projetos.find((p) => p.id === projetoSelecionado);

  // Estado local simplificado apenas para gerenciar a abertura do Picker nativo nesta View
  const [openDatePicker, setOpenDatePicker] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000060", "#3232B5", "#00007D"]}
        style={styles.container}
      >
        <AppHeader
          nomeUsuario={perfil?.nome}
          onLogout={handleLogout}
          mostrarVoltar={true}
          onVoltar={() => navigation.goBack()}
        />

        <View style={styles.header}>
          <Text style={styles.namepage}>NOVO LANÇAMENTO FINANCEIRO</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* SELETOR DE TIPO (Despesa / Imposto / Faturamento) */}
            <Text style={styles.labelCategoria}>TIPO DE REGISTRO</Text>
            <View style={styles.containerSegmentado}>
              {(["despesa", "imposto", "faturamento"] as TipoLancamento[]).map(
                (item) => {
                  const isActive = tipo === item;
                  let activeColor = "#ef4444"; // despesa
                  if (item === "faturamento") activeColor = "#10b981";
                  if (item === "imposto") activeColor = "#f59e0b";

                  return (
                    <Pressable
                      key={item}
                      style={[
                        styles.botaoSegmentado,
                        isActive && { backgroundColor: activeColor },
                      ]}
                      onPress={() => setTipo(item)}
                    >
                      <Text
                        style={[
                          styles.textoSegmentado,
                          isActive && styles.textoSegmentadoAtivo,
                        ]}
                      >
                        {item.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>

            {/* SELETOR DO PROJETO CUSTOMIZADO */}
            <Text style={styles.labelCategoria}>SELECIONE O PROJETO</Text>
            <Pressable
              style={styles.customPickerBotao}
              onPress={() => setModalProjetosVisivel(true)}
            >
              <Text
                style={[
                  styles.customPickerTexto,
                  !projetoAtual && styles.customPickerPlaceholder,
                ]}
              >
                {projetoAtual
                  ? projetoAtual.nome.toUpperCase()
                  : "ESCOLHA UM PROJETO..."}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#86EBFF" />
            </Pressable>

            {/* SELETOR DE DATA */}
            <SeletorDataHora
              rotulo="DATA DO EVENTO"
              valor={data}
              mostrar={openDatePicker}
              onPress={() => setOpenDatePicker(true)}
              onChange={setData}
              onClose={() => setOpenDatePicker(false)}
              modo="date"
              formato="date"
            />

            {/* CAMPO DE VALOR */}
            <Text style={styles.labelCategoria}>VALOR (R$)</Text>
            <TextInput
              style={styles.inputValor}
              placeholder="0,00"
              placeholderTextColor="rgba(255,255,255,0.7)"
              keyboardType="numeric"
              value={valor}
              onChangeText={setValor}
            />

            {/* DESCRIÇÃO / OBSERVAÇÃO */}
            <Text style={styles.labelCategoria}>DESCRIÇÃO / JUSTIFICATIVA</Text>

            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Ex: Nota fiscal de serviços, Compra de plotagem..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              multiline
              numberOfLines={3}
              value={descricao}
              onChangeText={setDescricao}
            />

            {/* BOTÃO SALVAR */}
            <Pressable
              style={({ pressed }) => [
                styles.botaoSalvar,
                pressed && { opacity: 0.8 },
              ]}
              onPress={salvarLancamento}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.textoBotaoSalvar}>
                  CONFIRMAR LANÇAMENTO
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>

        <AppCopyrigth />
      </LinearGradient>

      {/* MODAL DE SELEÇÃO DE PROJETOS */}
      <Modal
        visible={modalProjetosVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalProjetosVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={["#000040", "#000060"]}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>SELECIONE O PROJETO</Text>
              <Pressable
                onPress={() => setModalProjetosVisivel(false)}
                style={styles.modalBotaoFechar}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={28}
                  color="#FF8C00"
                />
              </Pressable>
            </View>

            <FlatList
              data={projetos}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <Text style={styles.modalEmptyText}>
                  Nenhum projeto ativo disponível.
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.modalItem,
                    projetoSelecionado === item.id && styles.modalItemAtivo,
                  ]}
                  onPress={() => {
                    setProjetoSelecionado(item.id);
                    setModalProjetosVisivel(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemTexto,
                      projetoSelecionado === item.id &&
                        styles.modalItemTextoAtivo,
                    ]}
                  >
                    {item.nome.toUpperCase()}
                  </Text>
                  {projetoSelecionado === item.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#86EBFF"
                    />
                  )}
                </Pressable>
              )}
            />
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  namepage: { fontSize: 22, color: "#fff", marginTop: 10, fontWeight: "bold" },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 10,
    paddingBottom: 40,
  },
  labelCategoria: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#c0c0c0",
    marginBottom: 10,
    marginTop: 5,
  },
  containerSegmentado: {
    flexDirection: "row",
    backgroundColor: "#3345c9",
    borderRadius: 12,
    padding: 6,
    marginBottom: 18,
    elevation: 4,
  },
  botaoSegmentado: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  textoSegmentado: {
    fontSize: 12,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.6)",
  },
  textoSegmentadoAtivo: {
    color: "#FFF",
  },
  customPickerBotao: {
    backgroundColor: "#3345c9",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  customPickerTexto: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "bold",
  },
  customPickerPlaceholder: {
    color: "#86EBFF",
    fontWeight: "normal",
  },
  input: {
    backgroundColor: "#3345c9",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 14,
    color: "#FFF",
    marginBottom: 16,
    elevation: 4,
  },
  inputValor: {
    backgroundColor: "#3345c9",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 16,
    elevation: 4,
  },
  inputMultiline: {
    height: 90,
    textAlignVertical: "top",
    paddingVertical: 12,
  },
  botaoSalvar: {
    backgroundColor: "#00aeff",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    elevation: 6,
  },
  textoBotaoSalvar: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    paddingBottom: 12,
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#86EBFF",
    letterSpacing: 0.5,
  },
  modalBotaoFechar: {
    padding: 2,
  },
  modalItem: {
    backgroundColor: "#3345c9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  modalItemAtivo: {
    borderWidth: 1,
    borderColor: "#86EBFF",
    backgroundColor: "#000090",
  },
  modalItemTexto: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalItemTextoAtivo: {
    color: "#86EBFF",
  },
  modalEmptyText: {
    color: "#FFF",
    textAlign: "center",
    marginTop: 30,
    opacity: 0.5,
  },
});
