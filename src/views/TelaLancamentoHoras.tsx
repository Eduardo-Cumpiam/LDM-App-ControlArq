// TelaLancamentoHoras.tsx
// Tela simplificada para lançamento de horas trabalhadas em projetos
// Mantendo estritamente os campos solicitados: data, horaini, horafim e observação.
// =====================================================================================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBackHandlerLogout } from "../hooks/useBackHandlerLogout";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useLancamentoHoras } from "../hooks/useLancamentoHoras";
import { globalStyles } from "../styles/globalStyles";

// Componentes
import AppHeader from "../components/AppHeader";
import AppCopyrigth from "../components/AppCopyrigth";
import SeletorDataHora from "../components/SeletorDataHora";
import CampoRotulo from "../components/CampoRotulo";

type RootStackParamList = {
  TelaLancamentoHoras: {
    projetoId: string;
    projetoNome: string;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, "TelaLancamentoHoras">;

export default function TelaLancamentoHoras({ route, navigation }: Props) {
  const { projetoId, projetoNome } = route.params;
  const { usuarioLogado, perfil, logout } = useAuth();

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

  const {
    data,
    setData,
    horaInicio,
    setHoraInicio,
    horaFim,
    setHoraFim,
    observacao,
    setObservacao,
    carregando,
    showDatePicker,
    showHoraInicioPicker,
    showHoraFimPicker,
    abrirDatePicker,
    fecharDatePicker,
    abrirHoraInicioPicker,
    fecharHoraInicioPicker,
    abrirHoraFimPicker,
    fecharHoraFimPicker,
    salvarLancamento,
  } = useLancamentoHoras({
    projetoId,
    projetoNome,
    usuarioId: usuarioLogado?.uid || "",
    usuarioNome: perfil?.nome || "",
  });

  const handleSalvar = async () => {
    const success = await salvarLancamento();
    if (success) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#000060", "#3232B5", "#00007D"]} style={styles.container}>

        <AppHeader
          nomeUsuario={perfil?.nome || "Usuário"}
          onLogout={handleLogout}
          mostrarVoltar={navigation.canGoBack()}
          onVoltar={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }}
        />

        <KeyboardAvoidingView
          style={styles.contentWrapper}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerSection}>
              <Text style={globalStyles.title}>Lançamento de Horas</Text>
              <Text style={globalStyles.description}>Registre as horas trabalhadas no projeto.</Text>
            </View>

            <View style={styles.formSection}>
              {/* Identificação estável do Projeto em modo leitura */}
              <CampoRotulo rotulo="Projeto" valor={projetoNome || ""} />

              {/* 1. Campo Data */}
              <SeletorDataHora
                rotulo="Data"
                valor={data}
                mostrar={showDatePicker}
                onPress={abrirDatePicker}
                onChange={setData}
                onClose={fecharDatePicker}
                modo="date"
                formato="date"
              />

              {/* 2. Campo Hora Início */}
              <SeletorDataHora
                rotulo="Hora Início"
                valor={horaInicio}
                mostrar={showHoraInicioPicker}
                onPress={abrirHoraInicioPicker}
                onChange={setHoraInicio}
                onClose={fecharHoraInicioPicker}
                modo="time"
                formato="time"
              />

              {/* 3. Campo Hora Fim */}
              <SeletorDataHora
                rotulo="Hora Fim"
                valor={horaFim}
                mostrar={showHoraFimPicker}
                onPress={abrirHoraFimPicker}
                onChange={setHoraFim}
                onClose={fecharHoraFimPicker}
                modo="time"
                formato="time"
              />

              {/* 4. Campo Observação */}
              <Text style={globalStyles.label}>Observação:</Text>
              <TextInput
                style={[globalStyles.input, globalStyles.textArea]}
                value={observacao}
                onChangeText={setObservacao}
                placeholder="Descreva a atividade realizada..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />

              {carregando ? (
                <ActivityIndicator
                  size="large"
                  color="#86EBFF"
                  style={{ marginTop: 15 }}
                />
              ) : (
                <View style={globalStyles.buttonContainer}>
                  <Button
                    title="Salvar Lançamento"
                    color="#00849e"
                    onPress={handleSalvar}
                  />
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
    paddingVertical: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  formSection: {
    width: "100%",
  },
});
