// SeletorDataHora.tsx
// Arquivo de componente para seleção de data e hora
//============================================================================================

import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { globalStyles } from '../styles/globalStyles';

interface SeletorDataHoraProps {
  rotulo: string;
  valor: Date;
  mostrar: boolean;
  onPress: () => void;
  onChange: (date: Date) => void;
  onClose: () => void; // Nova prop para fechar
  modo: 'date' | 'time';
  formato?: 'date' | 'time';
}

export default function SeletorDataHora({ 
  rotulo, 
  valor, 
  mostrar, 
  onPress, 
  onChange, 
  onClose,
  modo,
  formato = 'date'
}: SeletorDataHoraProps) {
  
  const formatarValor = () => {
    if (formato === 'date') {
      return valor.toLocaleDateString("pt-BR");
    } else {
      return valor.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    // Fecha o picker imediatamente
    onClose();
    
    // Se uma data foi selecionada, atualiza
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  // Para Android, o DateTimePicker pode ser mostrado inline
  // Para iOS, usamos o padrão com modal
  if (Platform.OS === 'android') {
    return (
      <>
        <Text style={globalStyles.label}>{rotulo}:</Text>
        <TouchableOpacity style={globalStyles.input} onPress={onPress}>
          <Text style={globalStyles.inputText}>{formatarValor()}</Text>
        </TouchableOpacity>
        
        {mostrar && (
          <DateTimePicker
            value={valor}
            mode={modo}
            is24Hour={modo === 'time'}
            display="default"
            onChange={handleChange}
          />
        )}
      </>
    );
  }

  // Para iOS, usamos a abordagem com modal
  return (
    <>
      <Text style={globalStyles.label}>{rotulo}:</Text>
      <TouchableOpacity style={globalStyles.input} onPress={onPress}>
        <Text style={globalStyles.inputText}>{formatarValor()}</Text>
      </TouchableOpacity>
      
      {mostrar && (
        <DateTimePicker
          value={valor}
          mode={modo}
          is24Hour={modo === 'time'}
          display="spinner"
          onChange={handleChange}
          style={{ backgroundColor: 'white' }}
        />
      )}
    </>
  );
}
