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
import AppCopyrigth from "../components/AppCopyrigth";
import { useAuth } from "../context/AuthContext";
import SeletorDataHora from "../components/SeletorDataHora";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  useLancamentoFinancas,
  TipoLancamento,
} from "../hooks/useLancamentoFinancas";
import { colors } from "../styles/colors";
import { globalStyles } from "../styles/globalStyles";

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
    <SafeAreaView style={globalStyles.container}>
      <LinearGradient
        colors={[colors.primarySoft, colors.background]}
        style={styles.container}
      >
        <AppHeader
          nomeUsuario={perfil?.nome}
          onLogout={handleLogout}
          mostrarVoltar={true}
          onVoltar={() => navigation.goBack()}
        />

        <Text style={globalStyles.title}>NOVO LANÇAMENTO FINANCEIRO</Text>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* SELETOR DE TIPO (Despesa / Imposto / Faturamento) */}
            <Text style={globalStyles.label}>Tipo de registro</Text>
            <View style={styles.containerSegmentado}>
              {(["despesa", "imposto", "faturamento"] as TipoLancamento[]).map(
                (item) => {
                  const isActive = tipo === item;
                  let activeColor = colors.danger; // despesa
                  if (item === "faturamento") activeColor = colors.success;
                  if (item === "imposto") activeColor = colors.warning;

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
            <Text style={globalStyles.label}>Selecione o projeto</Text>
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
                  : "Escolha um projeto..."}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>

            {/* SELETOR DE DATA */}
            <SeletorDataHora
              rotulo="Data do evento"
              valor={data}
              mostrar={openDatePicker}
              onPress={() => setOpenDatePicker(true)}
              onChange={setData}
              onClose={() => setOpenDatePicker(false)}
              modo="date"
              formato="date"
            />

            {/* CAMPO DE VALOR */}
            <Text style={globalStyles.label}>Valor (R$)</Text>
            <TextInput
              style={[globalStyles.input, styles.inputValorText]}
              placeholder="0,00"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={valor}
              onChangeText={setValor}
            />

            {/* DESCRIÇÃO / OBSERVAÇÃO */}
            <Text style={globalStyles.label}>Descrição / Justificativa</Text>

            <TextInput
              style={[globalStyles.input, globalStyles.textArea]}
              placeholder="Ex: Nota fiscal de serviços, Compra de plotagem..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
              value={descricao}
              onChangeText={setDescricao}
            />

            {/* BOTÃO SALVAR */}
            <Pressable
              style={({ pressed }) => [
                globalStyles.buttonPrimary,
                pressed && styles.buttonPressed,
              ]}
              onPress={salvarLancamento}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={globalStyles.buttonPrimaryText}>
                  Confirmar lançamento
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Selecione o projeto</Text>
              <Pressable
                onPress={() => setModalProjetosVisivel(false)}
                style={styles.modalBotaoFechar}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={28}
                  color={colors.danger}
                />
              </Pressable>
            </View>

            <FlatList
              data={projetos}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
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
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 10,
    paddingBottom: 40,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  containerSegmentado: {
    flexDirection: "row",
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },

  botaoSegmentado: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },

  textoSegmentado: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textSecondary,
  },

  textoSegmentadoAtivo: {
    color: colors.white,
  },

  customPickerBotao: {
    minHeight: 42,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  customPickerTexto: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },

  customPickerPlaceholder: {
    color: colors.textLight,
    fontWeight: "normal",
  },

  inputValorText: {
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.primarySoft,
  },

  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: "100%",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 12,
  },

  modalTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 0.5,
  },

  modalBotaoFechar: {
    padding: 2,
  },

  flatListContent: {
    paddingBottom: 20,
  },

  modalItem: {
    backgroundColor: colors.inputBackground,
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },

  modalItemAtivo: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  modalItemTexto: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },

  modalItemTextoAtivo: {
    color: colors.primary,
    fontWeight: "bold",
  },

  modalEmptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
});
