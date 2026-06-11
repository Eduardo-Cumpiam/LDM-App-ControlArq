// TelaExcluir.tsx
// Tela de Exclusão de Conta do aplicativo
// Esta tela somente pode ser acessada pelo gestor, para excluir o usuário e o supervisor, pois o acesso dos demais usuários somente é permitido através da TelaLogin.tsx.
// ====================================================================================================================

import React, { useState } from "react";
import { Text, Button, TextInput, Image, Pressable, StyleSheet, Alert, ActivityIndicator, SafeAreaView, Platform, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";

type RootStackParamList = {
  TelaCriarConta: undefined;
  TelaLogin: undefined;
  TelaInicial: undefined;
};

type TelaLoginNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaLogin">;

type Props = {
  navigation: TelaLoginNavigationProp;
};

export default function TelaLogin({ navigation }: Props) {

  // Estados para capturar os dados quando formos amarrar o login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregandoInterno, setCarregandoInterno] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      setCarregandoInterno(true);
      await login(email.trim(), senha);
      navigation.navigate("TelaInicial");
    } catch (error: any) {
      Alert.alert("Erro ao entrar", error.message);
    } finally {
      setCarregandoInterno(false);
    }
  };

  return (
    <LinearGradient
      colors={['#000060', '#3232B5', '#00007D']}
      style={styles.container}
    >

      <View style={styles.contentWrapper}>

        {/* BLOCO SUPERIOR: Título e Imagem */}
        <View style={styles.topSection}>
          <Text style={styles.title}>
            Controle para seus projetos de arquitetura na palma da sua mão.
          </Text>
          <Image
            source={require('../../assets/croqui.png')}
            style={styles.imageCroqui}
            resizeMode="contain"
          />
        </View>

        {/* BLOCO CENTRAL: Formulário de Login (Inputs e Botão) */}
        <View style={styles.formSection}>
          <Text style={styles.subtitle}>LOGIN:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="seu-email@provedor.com"
            placeholderTextColor="#999"
          />

          <Text style={styles.subtitle}>SENHA:</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            autoCapitalize="none"
            placeholder="******"
            placeholderTextColor="#999"
          />

          {carregandoInterno ? (
            <ActivityIndicator size="large" color="#86EBFF" style={{ marginVertical: 10 }} />
          ) : (
            <View style={styles.buttonContainer}>
              <Button
                title="Entrar"
                color="#00849e"
                onPress={handleLogin}
              />
            </View>
          )}
        </View>

        {/* BLOCO INFERIOR: Links e Rodapé */}
        <View style={styles.footerSection}>
          <Pressable onPress={() => navigation.replace("TelaCriarConta")}>
            <Text style={styles.footerLink}>
              não possui conta? crie a sua
            </Text>
          </Pressable>

          <Text style={styles.copyright}>
            All rights reserved. &copy;ControlARQ 2026
          </Text>
        </View>

      </View>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "space-between", // Divide o espaço disponível igualmente entre Topo, Centro e Rodapé
    paddingVertical: 20,
  },
  topSection: {
    alignItems: "center",
    flex: 1.8, // Dá uma prioridade de espaço ligeiramente maior para o topo respirar
    justifyContent: "center",
  },
  formSection: {
    width: "100%",
    justifyContent: "center",
    flex: 1.5, // Garante espaço fixo e firme para os inputs no meio da tela
  },
  footerSection: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 10,
  },
  title: {
    fontSize: 25, // Tamanho ideal para não estourar em telas pequenas
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "600",
    marginTop: 100,
  },
  imageCroqui: {
    width: "200%", // Ocupa uma porcentagem segura da largura do aparelho
    maxHeight: 200,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    height: 44,
    borderColor: '#fff',
    borderWidth: 2,
    marginBottom: 15,
    color: "#fff",
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Um leve fundo transparente para dar elegância
  },
  buttonContainer: {
    borderRadius: 6,
    overflow: "hidden", // Garante que a borda arredondada se aplique ao botão nativo
    marginTop: 10,
  },
  footerLink: {
    fontSize: 15,
    color: "#86EBFF",
    textAlign: "center",
    marginBottom: 15,
    textDecorationLine: "underline", // Um sublinhado sutil para indicar clique
  },
  copyright: {
    fontSize: 11,
    color: "#86EBFF",
    textAlign: "center",
    opacity: 0.6,
  }
});