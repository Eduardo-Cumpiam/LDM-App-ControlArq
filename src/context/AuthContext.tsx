// src/context/AuthContext.tsx
// Contexto global para gerenciar o estado de autenticação e permissões do ControlArq
// ===========================================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

export interface PerfilUsuario {
  id_usuario: string;
  nome: string;
  email: string;
  nivel_acesso: "gestor" | "supervisor" | "colaborador";
  valor_hora: number;
  telefone?: string;
  status: "pendente" | "autorizado" | "excluido";
}

interface AuthContextData {
  usuarioLogado: User | null;
  perfil: PerfilUsuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastrarNovoFuncionario: (
    idProvisorio: string,
    nome: string,
    email: string,
    nivelAcesso: "gestor" | "supervisor" | "colaborador",
    valorHora: number,
    telefone: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuarioLogado(user);
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
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

  const login = async (email: string, senha: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "usuarios", user.uid));

      if (userDoc.exists()) {
        const perfilData = userDoc.data() as PerfilUsuario;
        setPerfil(perfilData);
      } else {
        throw new Error("Perfil não encontrado no banco de dados.");
      }
    } catch (error: any) {
      if (__DEV__) {
        console.log("Erro de login:", error?.code, error?.message);
      }
      const mensagem = error?.message ?? "Falha ao realizar login. Verifique suas credenciais.";
      throw new Error(mensagem);
    }
  };

  const cadastrarNovoFuncionario = async (
    idProvisorio: string,
    nome: string,
    email: string,
    nivelAcesso: "gestor" | "supervisor" | "colaborador",
    valorHora: number,
    telefone: string
  ) => {
    try {
      await setDoc(doc(db, "usuarios", idProvisorio), {
        id_usuario: idProvisorio,
        nome,
        email,
        nivel_acesso: nivelAcesso,
        valor_hora: Number(valorHora),
        telefone,
        status: "pendente",
        data_cadastro: new Date().toISOString(),
      });
    } catch (error: any) {
      const mensagem = error?.message ?? "Erro ao salvar funcionário no banco de dados.";
      throw new Error(mensagem);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUsuarioLogado(null);
      setPerfil(null);
    } catch (error: any) {
      if (__DEV__) {
        console.log("Erro ao sair:", error?.message);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ usuarioLogado, perfil, carregando, login, cadastrarNovoFuncionario, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
