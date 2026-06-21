// CampoValor.tsx
// Arquivo
//====================================================================================

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

interface CampoValorProps {
  rotulo: string;
  valor: string;
  corValor: string;
}

export default function CampoValor({ rotulo, valor, corValor }: CampoValorProps) {
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
