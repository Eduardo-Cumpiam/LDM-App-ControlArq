// TelaGestaoEtapas.tsx
// Gestão de Etapas
// Permite listar, editar e inativar etapas cadastradas.
// ==================================================================

import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import AppHeader from "../components/AppHeader";
import AppCopyrigth from "../components/AppCopyrigth";
import { useBackHandlerLogout } from "../hooks/useBackHandlerLogout";
import { RootStackParamList } from "../navigation/AppNavigator";

// Firebase
import { db } from "../services/firebaseConfig";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
} from "firebase/firestore";

type TelaGestaoEtapasNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaGestaoEtapas">;

type Props = {
    navigation: TelaGestaoEtapasNavigationProp;
};

interface Etapa {
    id: string;
    nome_etapa: string;
    descricao?: string;
    ordem?: number;
    status: string;
}

export default function TelaGestaoEtapas({ navigation }: Props) {
    const { usuarioLogado, perfil, logout } = useAuth();

    const [etapas, setEtapas] = useState<Etapa[]>([]);
    const [carregando, setCarregando] = useState(true);

    // ✅ Hook para logout ao pressionar o botão de voltar
    useBackHandlerLogout();

    // ✅ Verifica se o usuário ainda está logado quando a tela ganha foco
    useFocusEffect(
        useCallback(() => {
            if (!usuarioLogado) {
                // O NavigatorInterno vai renderizar o stack de login automaticamente
                console.log('Usuário não está logado');
            }
        }, [usuarioLogado])
    );

    const handleLogout = async () => {
        await logout();
        // ⚠️ NÃO navegue para TelaLogin
        // O NavigatorInterno vai renderizar o stack de login automaticamente
    };

    const carregarEtapas = async () => {
        try {
            setCarregando(true);

            const snapshot = await getDocs(collection(db, "etapas"));

            const lista: Etapa[] = [];

            snapshot.forEach((docSnap) => {
                const dados = docSnap.data();

                lista.push({
                    id: docSnap.id,
                    nome_etapa: dados.nome_etapa || "",
                    descricao: dados.descricao || "",
                    ordem: dados.ordem || 0,
                    status: dados.status || "ativo",
                });
            });

            lista.sort((a, b) => {
                return (a.ordem || 0) - (b.ordem || 0);
            });

            setEtapas(lista);
        } catch (error) {
            Alert.alert("Erro", "Não foi possível carregar as etapas.");
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarEtapas();
    }, []);

    const atualizarEtapa = async (
        id: string,
        nome: string,
        descricao: string,
        ordem: number
    ) => {
        try {
            await updateDoc(doc(db, "etapas", id), {
                nome_etapa: nome,
                descricao,
                ordem,
            });

            Alert.alert("Sucesso", "Etapa atualizada.");
            carregarEtapas();
        } catch {
            Alert.alert("Erro", "Não foi possível atualizar.");
        }
    };

    const alterarStatus = async (
        id: string,
        statusAtual: string
    ) => {
        try {
            const novoStatus =
                statusAtual === "ativo"
                    ? "inativo"
                    : "ativo";

            await updateDoc(doc(db, "etapas", id), {
                status: novoStatus,
            });

            carregarEtapas();
        } catch {
            Alert.alert("Erro", "Falha ao alterar status.");
        }
    };

    if (!perfil || perfil.nivel_acesso !== "gestor") {
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#000060",
                }}
            >
                <Text style={{ color: "#fff" }}>
                    Acesso restrito a gestores.
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <LinearGradient colors={["#000060", "#3232B5", "#00007D"]} style={styles.container}>
                <AppHeader
                    nomeUsuario={perfil.nome}
                    onLogout={handleLogout}
                    mostrarVoltar={true}
                    onVoltar={() => {
                        navigation.navigate("TelaGestao");
                    }}
                />

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>Gestão de Etapas</Text>
                    <Text style={styles.description}>Edite, organize ou inative etapas.</Text>

                    {carregando ? (
                        <ActivityIndicator
                            size="large"
                            color="#86EBFF"
                            style={{ marginTop: 40 }}
                        />
                    ) : (
                        etapas.map((etapa) => (
                            <CardEtapa
                                key={etapa.id}
                                etapa={etapa}
                                onSalvar={atualizarEtapa}
                                onAlterarStatus={alterarStatus}
                            />
                        ))
                    )}
                </ScrollView>

                <AppCopyrigth />
            </LinearGradient>
        </SafeAreaView>
    );
}

interface CardProps {
    etapa: Etapa;
    onSalvar: (
        id: string,
        nome: string,
        descricao: string,
        ordem: number
    ) => void;

    onAlterarStatus: (
        id: string,
        statusAtual: string
    ) => void;
}

function CardEtapa({
    etapa,
    onSalvar,
    onAlterarStatus,
}: CardProps) {
    const [nome, setNome] = useState(etapa.nome_etapa);
    const [descricao, setDescricao] = useState(
        etapa.descricao || ""
    );
    const [ordem, setOrdem] = useState(
        String(etapa.ordem || 0)
    );

    return (
        <View style={styles.card}>
            <Text style={styles.label}>
                Nome da Etapa
            </Text>
            <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholderTextColor="#999"
                placeholder="Digite o nome da etapa"
            />

            <Text style={styles.label}>
                Descrição
            </Text>
            <TextInput
                style={styles.input}
                value={descricao}
                onChangeText={setDescricao}
                placeholderTextColor="#999"
                placeholder="Digite a descrição da etapa"
            />

            <Text style={styles.label}>
                Ordem
            </Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={ordem}
                onChangeText={setOrdem}
                placeholderTextColor="#999"
                placeholder="0"
            />

            <Text
                style={[
                    styles.status,
                    {
                        color:
                            etapa.status === "ativo"
                                ? "#00ff88"
                                : "#ff6666",
                    },
                ]}
            >
                Status: {etapa.status}
            </Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.buttonSalvar}
                    onPress={() =>
                        onSalvar(
                            etapa.id,
                            nome,
                            descricao,
                            Number(ordem)
                        )
                    }
                >
                    <Text style={styles.buttonText}>
                        Salvar
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonStatus}
                    onPress={() =>
                        onAlterarStatus(
                            etapa.id,
                            etapa.status
                        )
                    }
                >
                    <Text style={styles.buttonText}>
                        {etapa.status === "ativo"
                            ? "Inativar"
                            : "Ativar"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },

    title: {
        fontSize: 24,
        color: "#FFF",
        fontWeight: "bold",
        textAlign: "center",
    },

    description: {
        color: "#86EBFF",
        textAlign: "center",
        marginBottom: 20,
    },

    card: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },

    label: {
        color: "#FFF",
        marginBottom: 4,
        fontSize: 13,
    },

    input: {
        borderWidth: 1,
        borderColor: "#FFF",
        borderRadius: 6,
        paddingHorizontal: 10,
        height: 42,
        color: "#FFF",
        marginBottom: 10,
    },

    status: {
        marginBottom: 12,
        fontWeight: "600",
    },

    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    buttonSalvar: {
        backgroundColor: "#00849e",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 6,
    },

    buttonStatus: {
        backgroundColor: "#FF8C00",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 6,
    },

    buttonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
});
