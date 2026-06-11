// src/services/idGenerator.ts
// Serviço para geração de IDs sequenciais utilizando Firestore
// Este serviço é responsável por gerar IDs únicos e sequenciais para as entidades do aplicativo, como usuários, clientes, projetos, etapas e registros de horas. Ele utiliza uma coleção "counters" no Firestore para armazenar o último ID gerado para cada entidade, garantindo que os IDs sejam incrementados corretamente a cada nova criação. A função `gerarIdSequencial` recebe o nome da entidade como parâmetro e retorna o próximo ID disponível como string.
// Importações necessárias para interagir com o Firestore, incluindo funções para acessar documentos e a configuração do banco de dados.
// ====================================================================================================================

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Gera um novo ID sequencial para a entidade informada.
 * @param entidade Nome da entidade (usuarios, clientes, projetos, etapas, registro_horas)
 * @returns Novo ID como string
 */
export async function gerarIdSequencial(entidade: string): Promise<string> {
  const counterRef = doc(db, "counters", `${entidade}_counter`);
  const snapshot = await getDoc(counterRef);

  let novoId = 1;
  if (snapshot.exists()) {
    novoId = snapshot.data().ultimoId + 1;
  }

  await setDoc(counterRef, { ultimoId: novoId });

  return novoId.toString();
}