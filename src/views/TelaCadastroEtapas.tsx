// TelaCadastroEtapas.tsx
// Tela para cadastro de etapas de projetos, acessível apenas para usuários com perfil de Gestor
// Esta tela é protegida pela navegação condicional no AppNavigator, garantindo que apenas gestores possam acessá-la. O formulário de cadastro inclui campos para nome da etapa, descrição, data de início e data de término, e utiliza o Firebase Firestore para armazenar os dados das etapas cadastradas.
//===================================================================================================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TelaCadastroEtapas() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Cadastro de Etapas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, fontWeight: "bold" }
});
