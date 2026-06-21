// useLancamentoFinancas.ts
// Hook customizado para gerenciar regras de negócio e persistência de lançamentos financeiros.
// ====================================================================================================================

import { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { Alert } from "react-native";

export type TipoLancamento = "despesa" | "imposto" | "faturamento";

export interface ItemProjeto {
  id: string;
  nome: string; // Mantemos o nome da propriedade na interface para não quebrar a tela
}

export function useLancamentoFinancas(navigation: any) {
  const [projetos, setProjetos] = useState<ItemProjeto[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState("");
  const [tipo, setTipo] = useState<TipoLancamento>("despesa");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date());
  const [descricao, setDescricao] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Estados para controles de pickers
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Carrega apenas os projetos ativos para o combo de seleção
  useEffect(() => {
    async function obterProjetos() {
      try {
        const q = query(
          collection(db, "projetos"),
          where("status", "==", "Ativo"),
        );
        const querySnapshot = await getDocs(q);
        const listaProjetos: ItemProjeto[] = [];
        
        querySnapshot.forEach((doc) => {
          const dados = doc.data();
          listaProjetos.push({ 
            id: doc.id, 
            nome: dados.nome_projeto || "Sem nome" // ✅ Buscando o campo correto do Firestore
          });
        });
        
        setProjetos(listaProjetos);
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
        Alert.alert("Erro", "Não foi possível carregar a lista de projetos.");
      }
    }
    obterProjetos();
  }, []);

  const salvarLancamento = async () => {
    if (!projetoSelecionado) {
      Alert.alert("Atenção", "Por favor, selecione um projeto.");
      return;
    }

    const valorNumerico = parseFloat(valor.replace(",", "."));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert(
        "Atenção",
        "Por favor, insira um valor válido e maior que zero.",
      );
      return;
    }

    if (!descricao.trim()) {
      Alert.alert("Atenção", "Por favor, insira uma descrição ou observação.");
      return;
    }

    setCarregando(true); // ✅ Corrigido para true para exibir o ActivityIndicator do botão
    try {
      await addDoc(collection(db, "financas"), {
        projetoId: projetoSelecionado,
        tipo,
        valor: valorNumerico,
        data: Timestamp.fromDate(data),
        descricao: descricao.trim(),
        criadoEm: Timestamp.now(),
      });

      // Alterado o comportamento do OK: em vez de voltar à tela inicial, limpa os campos.
      Alert.alert("Sucesso", "Lançamento financeiro registrado!", [
        { 
          text: "OK", 
          onPress: () => {
            setData(new Date()); // Reseta para a data atual
            setValor("");        // Limpa o valor digitado
            setDescricao("");    // Limpa a justificativa
          } 
        },
      ]);
    } catch (error) {
      console.error("Erro ao salvar lançamento financeiro:", error);
      Alert.alert("Erro", "Falha ao registrar o lançamento. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return {
    projetos,
    projetoSelecionado,
    setProjetoSelecionado,
    tipo,
    setTipo,
    valor,
    setValor,
    data,
    setData,
    descricao,
    setDescricao,
    carregando,
    showDatePicker,
    salvarLancamento,
  };
}
