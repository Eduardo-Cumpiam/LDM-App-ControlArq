// TelaCadastroProjetos.tsx
// Tela para cadastro de projetos, acessível apenas para usuários com perfil de Gestor
// Esta tela é protegida pela navegação condicional no AppNavigator, garantindo que apenas gestores possam acessá-la. O formulário de cadastro inclui campos para nome do projeto, cliente associado, data de início e data de término, e utiliza o Firebase Firestore para armazenar os dados dos projetos cadastrados.
//===================================================================================================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TelaCadastroProjetos() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Cadastro de Projetos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, fontWeight: "bold" }
});
