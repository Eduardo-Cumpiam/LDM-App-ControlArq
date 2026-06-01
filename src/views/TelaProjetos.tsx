import React, { useState } from "react";
import { View, Text, TextInput, Image, Pressable, Modal, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";


export default function TelaProjetos() {
  const [modalVisible, setModalVisible] = useState(false);
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [descricao, setDescricao] = useState("");

  const adicionarProjeto = () => {
    console.log({ nomeProjeto, descricao });
    setNomeProjeto("");
    setDescricao("");
    setModalVisible(false);
  };

  return (
    <LinearGradient
      colors={["#000060", "#3232B5", "#00007D"]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.namepage}>PROJETOS</Text>

        <Ionicons
          name="add-circle"
          size={40}
          color="#00aeff"
          style={{ marginTop: 80 }}
          onPress={() => setModalVisible(true)}
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Novo Projeto</Text>

            <TextInput
              placeholder="Nome do Projeto"
              value={nomeProjeto}
              onChangeText={setNomeProjeto}
              style={styles.input}
            />

            <TextInput
              placeholder="Descrição"
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={4}
              style={[styles.input, styles.textArea]}
            />

            <Pressable
              style={styles.addButton}
              onPress={adicionarProjeto}
            >
              <Text style={styles.addButtonText}>
                Adicionar Projeto
              </Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.addButtonText}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.card}>
        <Image
          source={{
            uri: "https://picsum.photos/300/200",
          }}
          style={styles.image}
        />

        <View style={styles.content}>
          <Text style={styles.title}>
            Tempo Estimado:{" "}
            <Text style={styles.tempo_estimado}>1200h</Text>
          </Text>

          <Text style={styles.title}>
            Orçamento Estimado:{" "}
            <Text style={styles.orcamento_estimado}>
              R$50.000,00
            </Text>
          </Text>

          <Text style={styles.title}>
            Tempo Gasto:{" "}
            <Text style={styles.tempo_gasto}>175h</Text>
          </Text>

          <Text style={styles.title}>
            Orçamento Gasto:{" "}
            <Text style={styles.orcamento_gasto}>
              R$7.500,00
            </Text>
          </Text>

          <Text style={styles.descricao}>
            Esse é um exemplo simples de card bonito usando apenas
            React Native.
          </Text>

          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>
              TRABALHAR NESTE PROJETO
            </Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}




const styles = StyleSheet.create({
  container: {
    padding: 30,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  namepage: {
    fontSize: 25,
    color: "#fff",
    marginTop: 80,
    fontWeight: "bold",
  },
  card: {
    width: 320,
    marginTop: 20,
    backgroundColor: "#0017c9",
    borderRadius: 20,
    elevation: 8,
    overflow: "hidden",
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  tempo_estimado: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00cc22",
  },
  orcamento_estimado: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00cc22",
  },
  tempo_gasto: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ff4444",
  },
  orcamento_gasto: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ff4444",
  },
  descricao: {
    fontSize: 15,
    color: "#BBBBBB",
    lineHeight: 22,
    marginBottom: 20,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#00aeff",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  addButton: {
    backgroundColor: "#1226ff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#777",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});