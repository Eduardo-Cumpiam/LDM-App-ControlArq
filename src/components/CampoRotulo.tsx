// CampoRotulo.tsx
// Componente reutilizável para exibição de campos em modo leitura
//==================================================================

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';

interface CampoRotuloProps {
  rotulo: string;
  valor: string;
  corDestaque?: string;
}

export default function CampoRotulo({ rotulo, valor, corDestaque = colors.primary, }: CampoRotuloProps) {
  return (
    <>
      <Text style={globalStyles.label}>{rotulo}:</Text>
      <View style={[globalStyles.readOnlyField, { borderColor: corDestaque }]}>
        <Text style={[globalStyles.readOnlyText, { color: colors.textPrimary }]}>{valor}</Text>
      </View>
    </>
  );
}
