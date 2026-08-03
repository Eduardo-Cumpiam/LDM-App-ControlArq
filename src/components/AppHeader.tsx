// src/components/AppHeader.tsx
// Componente de Cabeçalho com nome do usuário e botão de logout
// Este componente é reutilizável e pode ser incluído em várias telas para manter a consistência visual. Ele exibe o nome do usuário logado (ou um título genérico se o nome não estiver disponível) e um ícone de logout que, quando pressionado, chama a função de logout fornecida via props.
// ====================================================================================================================

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/colors";

interface AppHeaderProps {
  nomeUsuario?: string;
  onLogout: () => void;
  mostrarVoltar?: boolean;
  onVoltar?: () => void; // Torna-se obrigatório o uso lógico na tela se mostrarVoltar for true
}

export default function AppHeader({
  nomeUsuario,
  onLogout,
  mostrarVoltar = false,
  onVoltar,
}: AppHeaderProps) {

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {mostrarVoltar && onVoltar && (
          <TouchableOpacity onPress={onVoltar} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.titulo}>{nomeUsuario ?? "Usuário"}</Text>
      </View>

      <TouchableOpacity onPress={onLogout} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="log-out-outline" size={28} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  titulo: {
    fontSize: 14,
    paddingLeft: 20,
    fontWeight: "bold",
    color: colors.warning,
  },
});
