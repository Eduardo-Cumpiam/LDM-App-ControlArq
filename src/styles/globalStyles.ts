// src/styles/globalStyles
// Este código armazena os estilos globais do sistema
//===========================================================================================

import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: { flex: 1 },
  
  readOnlyField: {
    minHeight: 42,
    borderWidth: 2,
    borderColor: "#86EBFF",
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: "rgba(134,235,255,0.08)",
  },
  
  readOnlyText: {
    color: "#fff",
    fontWeight: "600",
  },
  
  label: {
    fontSize: 13,
    color: "#fff",
    marginBottom: 4,
    fontWeight: "500",
  },
  
  input: {
    minHeight: 42,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  
  inputText: {
    color: "#fff",
  },
  
  pickerWrapper: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 6,
    marginBottom: 15,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  
  picker: {
    color: "#fff",
  },
  
  textArea: {
    height: 100,
    paddingTop: 10,
    textAlignVertical: "top",
    color: "#fff",
  },
  
  buttonContainer: {
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 10,
  },
  
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  
  description: {
    fontSize: 13,
    color: "#86EBFF",
    textAlign: "center",
  },
});
