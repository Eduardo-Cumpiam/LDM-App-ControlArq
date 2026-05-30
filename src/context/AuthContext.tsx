// src/context/AuthContext.tsx
// Contexto global para gerenciar o estado de autenticação e permissões do ControlArq
//========================================================================

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// 1. Definição do formato do perfil de usuário de acordo com as regras de negócio
interface PerfilUsuario {
  id_usuario: string;
  nome: string;
  email: string;
  nivel_acesso: 'Gestor' | 'Supervisor' | 'Colaborador';
  cargo: 'Sênior' | 'Pleno' | 'Júnior' | 'Estagiário';
  valor_hora_tecnica: number;
}

// 2. Contrato de tudo o que o contexto vai exportar para as telas usarem
interface AuthContextData {
  usuarioLogado: User | null;
  perfil: PerfilUsuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastrarNovoFuncionario: (
    idProvisorio: string,
    nome: string, 
    email: string, 
    nivelAcesso: 'Gestor' | 'Supervisor' | 'Colaborador',
    cargo: 'Sênior' | 'Pleno' | 'Júnior' | 'Estagiário',
    valorHora: number
  ) => Promise<void>;
  deslogar: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Monitor de estado: verifica se o usuário já estava logado ao abrir o app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuarioLogado(user);
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          setPerfil(userDoc.data() as PerfilUsuario);
        }
      } else {
        setUsuarioLogado(null);
        setPerfil(null);
      }
      setCarregando(false);
    });
    return unsubscribe;
  }, []);

  // Função para a sua telaLogin realizar a autenticação
  const login = async (email: string, senha: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      if (userDoc.exists()) {
        setPerfil(userDoc.data() as PerfilUsuario);
      } else {
        throw new Error('Perfil não encontrado no banco de dados.');
      }
    } catch (error: any) {
      throw new Error('E-mail ou senha incorretos. Verifique suas credenciais.');
    }
  };

  // Função que a tela privada do Gestor vai chamar para cadastrar a equipe
  const cadastrarNovoFuncionario = async (
    idProvisorio: string,
    nome: string, 
    email: string, 
    nivelAcesso: 'Gestor' | 'Supervisor' | 'Colaborador',
    cargo: 'Sênior' | 'Pleno' | 'Júnior' | 'Estagiário',
    valorHora: number
  ) => {
    try {
      await setDoc(doc(db, 'usuarios', idProvisorio), {
        id_usuario: idProvisorio,
        nome,
        email,
        nivel_acesso: nivelAcesso,
        cargo,
        valor_hora_tecnica: Number(valorHora),
        data_cadastro: new Date().toISOString()
      });
    } catch (error: any) {
      throw new Error('Erro ao salvar funcionário no banco de dados do Firestore.');
    }
  };

  // Função para encerrar a sessão
  const deslogar = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ usuarioLogado, perfil, carregando, login, cadastrarNovoFuncionario, deslogar }}>
      {children}
    </AuthContext.Provider>
  );
};