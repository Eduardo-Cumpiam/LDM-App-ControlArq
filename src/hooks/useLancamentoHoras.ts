// useLancamentoHoras.ts
// Hook de lógica para lançamento de horas trabalhadas em projetos
// Inclui validação de segurança para impedir lançamentos anteriores à criação do projeto.
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
        return false;
      }

      setCarregando(true);

      // 1. Busca os metadados do projeto primeiro para validar a data retroativa
      const projetoRef = doc(db, "projetos", projetoId);
      const projetoSnap = await getDoc(projetoRef);
      
      if (!projetoSnap.exists()) {
        Alert.alert("Erro", "Projeto não encontrado.");
        return false;
      }

      const projetoData = projetoSnap.data();
      // Verifica se o campo no Firestore chama 'data_inicio' ou 'criadoEm'
      const timestampInicio = projetoData.data_inicio || projetoData.criadoEm;

      if (timestampInicio) {
        const dataInicioProjeto = timestampInicio.toDate();

        // Zera as horas de ambas as datas para fazer a comparação linear pura por dia
        const dataLancamentoZero = new Date(data.getTime());
        dataLancamentoZero.setHours(0, 0, 0, 0);

        const dataInicioProjetoZero = new Date(dataInicioProjeto.getTime());
        dataInicioProjetoZero.setHours(0, 0, 0, 0);

        // 🛑 TRAVA DE REGRA DE NEGÓCIO
        if (dataLancamentoZero < dataInicioProjetoZero) {
          Alert.alert(
            "Data Inválida",
            `Este projeto foi iniciado/cadastrado em ${dataInicioProjeto.toLocaleDateString('pt-BR')}.\n\nNão é permitido efetuar lançamentos retroativos anteriores a esta data.`
          );
          return false;
        }
      }

      // 2. Garante que pegamos o valor da hora mais atualizado do usuário direto do banco
      let valorHoraAtual = valorHoraTecnica;
      if (usuarioId) {
        const usuarioRef = doc(db, "usuarios", usuarioId);
        const usuarioSnap = await getDoc(usuarioRef);
        if (usuarioSnap.exists()) {
          valorHoraAtual = usuarioSnap.data().valor_hora_tecnica || 0;
        }
      }

      const custoTotalCalculado = Number((duracaoTotal * valorHoraAtual).toFixed(2));

      // 3. Salva o registro de horas simplificado no Firestore
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

      // 4. Atualiza os acumulados agregados no documento do projeto (usando os dados capturados no passo 1)
      const horasAtuais = projetoData.horas_gastas || 0;
      const horasOrcadas = projetoData.horas_orcadas || 0;
      const custoAcumuladoAtual = projetoData.valor_gasto || 0;

      const novasHoras = horasAtuais + duracaoTotal;
      const novoCustoAcumulado = custoAcumuladoAtual + custoTotalCalculado;
      const percentual = horasOrcadas > 0 ? Number(((novasHoras / horasOrcadas) * 100).toFixed(2)) : 0;

      await updateDoc(projetoRef, {
        horas_gastas: novasHoras,
        percentual_conclusao: percentual,
        valor_gasto: novoCustoAcumulado,
      });

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
