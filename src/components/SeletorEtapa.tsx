// SeletorEtapa.tsx
// Arquivo
//=======================================================================================

import React from 'react';
import { Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { globalStyles } from '../styles/globalStyles';

interface Etapa {
  id: string;
  nome_etapa: string;
}

interface SeletorEtapaProps {
  etapas: Etapa[];
  selecionada: string;
  onChange: (value: string) => void;
}

export default function SeletorEtapa({ etapas, selecionada, onChange }: SeletorEtapaProps) {
  return (
    <>
      <Text style={globalStyles.label}>Etapa:</Text>
      <View style={globalStyles.pickerWrapper}>
        <Picker selectedValue={selecionada} onValueChange={onChange} style={globalStyles.picker}>
          <Picker.Item label="Selecione uma etapa" value="" />
          {etapas.map((etapa) => (
            <Picker.Item key={etapa.id} label={etapa.nome_etapa} value={etapa.id} />
          ))}
        </Picker>
      </View>
    </>
  );
}
