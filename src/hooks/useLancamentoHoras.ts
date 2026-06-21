// useLancamentoHoras.ts
// Hook de lógica para lançamento de horas trabalhadas em projetos
// Mantém os cálculos em segundo plano e remove as dependências de etapas.
//=======================================================================================================

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { addDoc, collection, Timestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../services/firebaseConfig';

interface UseLancamentoHorasProps {
  projetoId: string;
  projetoNome: string;
  usuarioId: string;
  usuarioNome: string;
}

export function useLancamentoHoras({ projetoId, projetoNome, usuarioId, usuarioNome }: UseLancamentoHorasProps) {
  const [data, setData] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date());
  const [observacao, setObservacao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [duracaoTotal, setDuracaoTotal] = useState(0);
  const [valorHoraTecnica, setValorHoraTecnica] = useState(0);
  
  // Estados para controles de pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHoraInicioPicker, setShowHoraInicioPicker] = useState(false);
  const [showHoraFimPicker, setShowHoraFimPicker] = useState(false);

  useEffect(() => {
    carregarValorHoraUsuario();
  }, []);

  useEffect(() => {
    calcularDuracao();
  }, [horaInicio, horaFim]);

  const carregarValorHoraUsuario = async () => {
    try {
      if (!usuarioId) return;
      const usuarioRef = doc(db, "usuarios", usuarioId);
      const usuarioSnap = await getDoc(usuarioRef);
      if (usuarioSnap.exists()) {
        const dados = usuarioSnap.data();
        setValorHoraTecnica(dados.valor_hora_tecnica || 0);
      }
    } catch (error) {
      console.error("Erro ao carregar valor hora do usuário:", error);
    }
  };

  const calcularDuracao = () => {
    const diff = horaFim.getTime() - horaInicio.getTime();
    setDuracaoTotal(diff > 0 ? Number((diff / (1000 * 60 * 60)).toFixed(2)) : 0);
  };

  // Funções para abrir/fechar pickers
  const abrirDatePicker = () => {
    setShowDatePicker(true);
    setShowHoraInicioPicker(false);
    setShowHoraFimPicker(false);
  };

  const fecharDatePicker = () => {
    setShowDatePicker(false);
  };

  const abrirHoraInicioPicker = () => {
    setShowHoraInicioPicker(true);
    setShowDatePicker(false);
    setShowHoraFimPicker(false);
  };

  const fecharHoraInicioPicker = () => {
    setShowHoraInicioPicker(false);
  };

  const abrirHoraFimPicker = () => {
    setShowHoraFimPicker(true);
    setShowDatePicker(false);
    setShowHoraInicioPicker(false);
  };

  const fecharHoraFimPicker = () => {
    setShowHoraFimPicker(false);
  };

  const salvarLancamento = async () => {
    try {
      if (horaFim <= horaInicio) {
        Alert.alert("Atenção", "Hora final deve ser maior que hora inicial.");
        return;
      }

      setCarregando(true);

      // Garante que pegamos o valor da hora mais atualizado direto do banco
      let valorHoraAtual = valorHoraTecnica;
      if (usuarioId) {
        const usuarioRef = doc(db, "usuarios", usuarioId);
        const usuarioSnap = await getDoc(usuarioRef);
        if (usuarioSnap.exists()) {
          valorHoraAtual = usuarioSnap.data().valor_hora_tecnica || 0;
        }
      }

      const custoTotalCalculado = Number((duracaoTotal * valorHoraAtual).toFixed(2));

      // 1. Salva o registro de horas simplificado no Firestore
      await addDoc(collection(db, "registro_horas"), {
        fk_projeto: projetoId,
        projeto_nome: projetoNome,
        fk_usuario: usuarioId,
        usuario_nome: usuarioNome,
        data_lancamento: Timestamp.fromDate(data),
        hora_inicio: Timestamp.fromDate(horaInicio),
        hora_fim: Timestamp.fromDate(horaFim),
        duracao_total: duracaoTotal,
        valor_hora_tecnica: valorHoraAtual,
        custo_total: custoTotalCalculado,
        observacao,
        status: "ativo",
        data_criacao: Timestamp.fromDate(new Date()),
      });

      // 2. Atualiza os acumulados agregados no documento do projeto
      const projetoRef = doc(db, "projetos", projetoId);
      const projetoSnap = await getDoc(projetoRef);
      if (projetoSnap.exists()) {
        const projeto = projetoSnap.data();
        const horasAtuais = projeto.horas_gastas || 0;
        const horasOrcadas = projeto.horas_orcadas || 0;
        const custoAcumuladoAtual = projeto.valor_gasto || 0;

        const novasHoras = horasAtuais + duracaoTotal;
        const novoCustoAcumulado = custoAcumuladoAtual + custoTotalCalculado;
        const percentual = horasOrcadas > 0 ? Number(((novasHoras / horasOrcadas) * 100).toFixed(2)) : 0;

        await updateDoc(projetoRef, {
          horas_gastas: novasHoras,
          percentual_conclusao: percentual,
          valor_gasto: novoCustoAcumulado,
        });
      }

      Alert.alert(
        "Sucesso",
        `Horas lançadas com sucesso!\n\n` +
        `Duração: ${duracaoTotal.toFixed(2)} horas.`
      );

      return true;
    } catch (error: any) {
      Alert.alert("Erro", error.message);
      return false;
    } finally {
      setCarregando(false);
    }
  };

  return {
    data,
    setData,
    horaInicio,
    setHoraInicio,
    horaFim,
    setHoraFim,
    observacao,
    setObservacao,
    carregando,
    showDatePicker,
    showHoraInicioPicker,
    showHoraFimPicker,
    abrirDatePicker,
    fecharDatePicker,
    abrirHoraInicioPicker,
    fecharHoraInicioPicker,
    abrirHoraFimPicker,
    fecharHoraFimPicker,
    salvarLancamento,
  };
}
