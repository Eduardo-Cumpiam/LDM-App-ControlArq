// CampoRotulo.tsx
// Arquivo 
//=======================================================================================

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

interface CampoRotuloProps {
  rotulo: string;
  valor: string;
  corDestaque?: string;
}

export default function CampoRotulo({ rotulo, valor, corDestaque = "#86EBFF" }: CampoRotuloProps) {
  return (
    <>
      <Text style={globalStyles.label}>{rotulo}:</Text>
      <View style={[globalStyles.readOnlyField, { borderColor: corDestaque }]}>
        <Text style={[globalStyles.readOnlyText, { color: corDestaque }]}>{valor}</Text>
      </View>
    </>
  );
}
