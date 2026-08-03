// src/styles/globalStyles
// Este código armazena os estilos globais do sistema
//===========================================================================================

import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const globalStyles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: colors.background,
  },
  
  readOnlyField: {
    minHeight: 42,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: colors.inputBackground,
  },
  
  readOnlyText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  
  label: {
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 4,
    fontWeight: "500",
  },
  
  input: {
    minHeight: 42,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  
  inputText: {
    color: colors.textPrimary,
  },
  
  pickerWrapper: {
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 6,
    marginBottom: 15,
    backgroundColor: colors.surface,
  },
  
  picker: {
    color: colors.textPrimary,
  },
  
  textArea: {
    height: 100,
    paddingTop: 10,
    textAlignVertical: "top",
    color: colors.textPrimary,
  },
  
  buttonContainer: {
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 10,
    backgroundColor: colors.primary,
  },

  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  buttonPrimaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  
  title: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
