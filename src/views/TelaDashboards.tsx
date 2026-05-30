// TelaDashboards.tsx
// Tela para exibir os dashboards
//===============================================================

import React from "react";
import { View, Text, Button, TextInput, Image, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {

};

type TelaDashboardsNavigationProp = NativeStackNavigationProp<RootStackParamList, "TelaDashboards">;

type Props = {
    navigation: TelaDashboardsNavigationProp;
};

export default function TelaDashboards({ navigation }: Props) {
    return (
        <LinearGradient
            colors={['#000060', '#3232B5', '#00007D']}
            style={styles.container}
        >


        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
}); 