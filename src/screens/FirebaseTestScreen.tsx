// FirebaseTestScreen.tsx
// Tela para testar a conexão com o Firebase Firestore
//===============================================================

import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { db } from "../services/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function FirebaseTestScreen() {
  const [status, setStatus] = useState("Testando conexão...");

  useEffect(() => {
    async function testFirebase() {
      try {
        // Escreve um documento de teste
        const docRef = await addDoc(collection(db, "testCollection"), {
          message: "Conexão Firebase OK!",
          timestamp: new Date(),
        });

        console.log("Documento escrito com ID:", docRef.id);

        // Lê os documentos da coleção
        const querySnapshot = await getDocs(collection(db, "testCollection"));
        querySnapshot.forEach((doc) => {
          console.log(`${doc.id} =>`, doc.data());
        });

        setStatus("✅ Conexão com Firebase funcionando!");
      } catch (error) {
        console.error("Erro ao conectar com Firebase:", error);
        setStatus("❌ Erro ao conectar com Firebase");
      }
    }

    testFirebase();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{status}</Text>
    </View>
  );
}
