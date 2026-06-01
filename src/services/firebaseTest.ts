// firebaseTest.ts
// Arquivo para testar a conexão com o Firebase Firestore
//===============================================================

import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

export async function testFirebaseConnection() {
  try {
    // Cria uma coleção de teste
    const docRef = await addDoc(collection(db, "testCollection"), {
      message: "Conexão Firebase OK!",
      timestamp: new Date()
    });

    console.log("Documento escrito com ID:", docRef.id);

    // Lê os documentos da coleção
    const querySnapshot = await getDocs(collection(db, "testCollection"));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} =>`, doc.data());
    });

    return true;
  } catch (error) {
    console.error("Erro ao conectar com Firebase:", error);
    return false;
  }
}