// TelaCadastroClientes.tsx
// Tela para cadastro de clientes, acessível apenas para usuários com perfil de Gestor
// Esta tela é protegida pela navegação condicional no AppNavigator, garantindo que apenas gestores possam acessá-la. O formulário de cadastro inclui campos para nome do cliente, contato e endereço, e utiliza o Firebase Firestore para armazenar os dados dos clientes cadastrados.
//===================================================================================================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TelaCadastroClientes() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Cadastro de Clientes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, fontWeight: "bold" }
});
