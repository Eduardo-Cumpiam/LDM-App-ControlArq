// src/components/AppCopyrigth.tsx
// Componente simples para exibir o texto de copyright no rodapé das telas.
// Este componente é reutilizado em todas as telas para manter a consistência visual e reforçar a identidade da marca.
// ====================================================================================================================

import React from "react";
import { Text, StyleSheet } from "react-native";

export default function AppFooter() {
  return (
    <Text style={styles.footerText}>
      All rights reserved. ©ControlArq 2026
    </Text>
  );
}

const styles = StyleSheet.create({
  footerText: {
    fontSize: 11,
    color: "#86EBFF",
    textAlign: "center",
    opacity: 0.6,
    paddingTop: 10,
    paddingBottom: 10,
  },
});
