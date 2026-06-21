// src/hooks/useAuth.ts
// Arquivo de hook para acesso ao contexto de autenticação
// Hook customizado para facilitar e encurtar o acesso ao contexto nas Views
//========================================================================

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser utilizado obrigatoriamente dentro de um AuthProvider');
  }
  
  return context;
};