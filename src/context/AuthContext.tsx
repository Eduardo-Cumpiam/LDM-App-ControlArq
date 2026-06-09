// src/context/AuthContext.tsx
// Contexto global para gerenciar o estado de autenticação e permissões do ControlArq
// O AuthContext é o coração do sistema de autenticação do ControlArq. Ele é responsável por manter o estado do usuário logado, seu perfil e as funções de login, cadastro e logout. Todas as telas do aplicativo podem acessar essas informações e funções através do hook useAuth, garantindo uma experiência consistente e segura em todo o app. O AuthProvider deve envolver toda a aplicação para que o contexto esteja disponível globalmente.
//===========================================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// 1. Definição do formato do perfil de usuário
interface PerfilUsuario {
  id_usuario: string;
  nome: string;
  email: string;
  nivel_acesso: 'gestor' | 'supervisor' | 'colaborador';
  cargo: 'Sênior' | 'Pleno' | 'Júnior' | 'Estagiário';
  valor_hora_tecnica: number;
  status: 'pendente' | 'autorizado' | 'excluído';
}

// 2. Contrato do contexto
interface AuthContextData {
  usuarioLogado: User | null;
  perfil: PerfilUsuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastrarNovoFuncionario: (
    idProvisorio: string,
    nome: string,
    email: string,
    nivelAcesso: 'gestor' | 'supervisor' | 'colaborador',
    cargo: 'Sênior' | 'Pleno' | 'Júnior' | 'Estagiário',
    valorHora: number
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Monitor de estado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuarioLogado(user);
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          const perfilData = userDoc.data() as PerfilUsuario;
          setPerfil(perfilData);
        }
      } else {
        setUsuarioLogado(null);
        setPerfil(null);
      }
      setCarregando(false);
    });
    return unsubscribe;
  }, []);

  // Função de login com validação de status
  const login = async (email: string, senha: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

      if (userDoc.exists()) {
        const perfilData = userDoc.data() as PerfilUsuario;
        if (perfilData.status !== 'autorizado') {
          throw new Error('Usuário ainda não autorizado pelo gestor.');
        }
        setPerfil(perfilData);
      } else {
        throw new Error('Perfil não encontrado no banco de dados.');
      }
    } catch (error: any) {
      console.error("Erro de login:", error.code, error.message);
      throw new Error(error.message);
    }
  };

  // Cadastro inicial de funcionário (sempre pendente)
  const cadastrarNovoFuncionario = async (
    idProvisorio: string,
    nome: string,
    email: string,
    nivelAcesso: 'gestor' | 'supervisor' | 'colaborador',
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
        status: 'pendente', // sempre começa como pendente
        data_cadastro: new Date().toISOString()
      });
    } catch (error: any) {
      throw new Error('Erro ao salvar funcionário no banco de dados do Firestore.');
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUsuarioLogado(null);
      setPerfil(null);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ usuarioLogado, perfil, carregando, login, cadastrarNovoFuncionario, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para consumir o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
