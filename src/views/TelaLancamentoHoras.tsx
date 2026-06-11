// TelaLancamentoHoras.tsx
// Tela para lançamento de horas trabalhadas em projetos
// Esta tela pode ser acessada pelo gestor, supervisor e colaborador para registrar as horas dedicadas a cada projeto, etapa e atividade
// O lançamento de horas é fundamental para o controle de custos, acompanhamento do progresso e análise de desempenho dos projetos
// =====================================================================================================================

import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert, Platform, TextInput } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../services/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Definição das rotas que podem passar params
type RootStackParamList = {
  TelaLancamentoHoras: { projetoId: string; projetoNome: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "TelaLancamentoHoras">;

export default function TelaLancamentoHoras({ route, navigation }: Props) {
  
  const { projetoId, projetoNome } = route.params;
  const { usuarioLogado } = useAuth();

  const [data, setData] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date());
  const [observacao, setObservacao] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHoraInicioPicker, setShowHoraInicioPicker] = useState(false);
  const [showHoraFimPicker, setShowHoraFimPicker] = useState(false);

  const salvarLancamento = async () => {
    try {
      if (horaFim <= horaInicio) {
        Alert.alert("Erro", "Hora fim deve ser maior que hora início.");
        return;
      }

      const duracaoHoras = (horaFim.getTime() - horaInicio.getTime()) / (1000 * 60 * 60);

      await addDoc(collection(db, "registro_horas"), {
        data,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        duracao_total: duracaoHoras,
        fk_projeto: projetoId,
        fk_usuario: usuarioLogado?.uid || "",
        fk_etapa: "",
        observacao,
      });

      Alert.alert("Sucesso", "Horas lançadas com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projeto: {projetoNome}</Text>

      {/* Seleção da Data */}
      <Button
        title={`Data: ${data.toLocaleDateString()}`}
        onPress={() => setShowDatePicker(true)}
      />
      {showDatePicker && (
        <DateTimePicker
          value={data}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setData(selectedDate);
          }}
        />
      )}

      {/* Seleção Hora Início */}
      <Button
        title={`Hora início: ${horaInicio.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
        onPress={() => setShowHoraInicioPicker(true)}
      />
      {showHoraInicioPicker && (
        <DateTimePicker
          value={horaInicio}
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedTime) => {
            setShowHoraInicioPicker(false);
            if (selectedTime) setHoraInicio(selectedTime);
          }}
        />
      )}

      {/* Seleção Hora Fim */}
      <Button
        title={`Hora fim: ${horaFim.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
        onPress={() => setShowHoraFimPicker(true)}
      />
      {showHoraFimPicker && (
        <DateTimePicker
          value={horaFim}
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedTime) => {
            setShowHoraFimPicker(false);
            if (selectedTime) setHoraFim(selectedTime);
          }}
        />
      )}

      {/* Observação */}
      <Text style={styles.label}>Observação:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite uma observação"
        value={observacao}
        onChangeText={setObservacao}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Salvar" onPress={salvarLancamento} />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#000060" 
  },
  title: { 
    color: "#fff", 
    fontSize: 18, 
    marginBottom: 20 
  },
  label: { 
    color: "#fff", 
    marginTop: 15, 
    marginBottom: 5 
  },
  input: {
    backgroundColor: "#fff",
    marginBottom: 15,
    padding: 10,
    borderRadius: 6,
  },
});