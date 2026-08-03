// CampoValor.tsx
// Componente reutilizável para exibição de valores numéricos/destacados em modo leitura
//=======================================================================================

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';

interface CampoValorProps {
  rotulo: string;
  valor: string;
  corValor?: string;
}

export default function CampoValor({ rotulo, valor, corValor = colors.primary, }: CampoValorProps) {
  return (
    <>
      <Text style={globalStyles.label}>{rotulo}:</Text>
      <View style={[globalStyles.readOnlyField, styles.center]}>
        <Text style={[styles.valor, { color: corValor }]}>{valor}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
  },
  valor: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
