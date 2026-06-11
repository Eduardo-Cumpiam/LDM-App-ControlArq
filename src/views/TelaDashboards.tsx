// TelaDashboards.tsx
// Tela de Dashboards do aplicativo
// Esta tela pode ser acessada a partir do menu lateral ou de outras telas
//===============================================================

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
    TelaDashboards: undefined;
};

type TelaDashboardsNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "TelaDashboards">;

type Props = {
    navigation: TelaDashboardsNavigationProp;
};

// Interface para dados de métricas
interface DashboardMetrics {
    horasOrcadas: number;
    tempoGasto: number;
    custoAtual: number;
    orcamentoTotal: number;
}

export default function TelaDashboards({ navigation }: Props) {
    
    // Dados mock - Balanço Mensal
    const [metrics] = useState<DashboardMetrics>({
        horasOrcadas: 160,      // horas totais orçadas
        tempoGasto: 98,         // tempo total gasto
        custoAtual: 4900,       // custo atual em R$
        orcamentoTotal: 8000,   // orçamento total em R$
    });

    // Dados para o gráfico circular
    // Removido - usando barra de progresso visual em vez disso

    // Percentuais
    const percentualTempo = Math.round((metrics.tempoGasto / metrics.horasOrcadas) * 100);
    const percentualCusto = Math.round((metrics.custoAtual / metrics.orcamentoTotal) * 100);

    return (
        <LinearGradient
            colors={['#000060', '#3232B5', '#00007D']}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <Text style={styles.title}>Dashboard Mensal</Text>
                    <Text style={styles.subtitle}>Balanço de Projetos</Text>
                </View>

                {/* Gráfico Circular */}
                <View style={styles.chartContainer}>
                    <View style={styles.chartWrapper}>
                        {/* Barra de progresso visual */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${percentualTempo}%`, backgroundColor: '#FF6B6B' },
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>
                                {percentualTempo}% do tempo orçado utilizado
                            </Text>
                        </View>
                    </View>

                    {/* Legenda e Percentual */}
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View
                                style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]}
                            />
                            <View style={styles.legendText}>
                                <Text style={styles.legendLabel}>Tempo Gasto</Text>
                                <Text style={styles.legendValue}>
                                    {metrics.tempoGasto}h ({percentualTempo}%)
                                </Text>
                            </View>
                        </View>

                        <View style={styles.legendItem}>
                            <View
                                style={[styles.legendColor, { backgroundColor: '#4ECDC4' }]}
                            />
                            <View style={styles.legendText}>
                                <Text style={styles.legendLabel}>Tempo Restante</Text>
                                <Text style={styles.legendValue}>
                                    {metrics.horasOrcadas - metrics.tempoGasto}h ({100 - percentualTempo}%)
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Cards de Métricas */}
                <View style={styles.metricsGrid}>
                    {/* Card 1: Horas Orçadas */}
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Horas Orçadas</Text>
                        <Text style={styles.metricValue}>{metrics.horasOrcadas}h</Text>
                        <Text style={styles.metricSubtext}>Total do período</Text>
                    </View>

                    {/* Card 2: Tempo Gasto */}
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Tempo Gasto</Text>
                        <Text style={styles.metricValue}>{metrics.tempoGasto}h</Text>
                        <Text style={styles.metricSubtext}>{percentualTempo}% utilizado</Text>
                    </View>

                    {/* Card 3: Custo Atual */}
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Custo Atual</Text>
                        <Text style={styles.metricValue}>R$ {metrics.custoAtual.toLocaleString('pt-BR')}</Text>
                        <Text style={styles.metricSubtext}>{percentualCusto}% do orçamento</Text>
                    </View>

                    {/* Card 4: Orçamento Total */}
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Orçamento Total</Text>
                        <Text style={styles.metricValue}>R$ {metrics.orcamentoTotal.toLocaleString('pt-BR')}</Text>
                        <Text style={styles.metricSubtext}>Disponível</Text>
                    </View>
                </View>

                {/* Resumo Mensal */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Resumo do Mês</Text>
                    <View style={styles.summaryContent}>
                        <SummaryRow
                            label="Orçamento Restante"
                            value={`R$ ${(metrics.orcamentoTotal - metrics.custoAtual).toLocaleString('pt-BR')}`}
                            color="#4ECDC4"
                        />
                        <SummaryRow
                            label="Horas Restantes"
                            value={`${metrics.horasOrcadas - metrics.tempoGasto}h`}
                            color="#95E1D3"
                        />
                        <SummaryRow
                            label="Taxa Horária"
                            value={`R$ ${(metrics.custoAtual / metrics.tempoGasto).toFixed(2)}`}
                            color="#A8E6CF"
                        />
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

// Componente auxiliar para linhas de resumo
function SummaryRow({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <View style={styles.summaryRow}>
            <View style={[styles.summaryDot, { backgroundColor: color }]} />
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={styles.summaryValue}>{value}</Text>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#B0B0FF',
    },
    chartContainer: {
        marginHorizontal: 20,
        marginVertical: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    chartWrapper: {
        alignItems: 'center',
        marginBottom: 20,
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: '#B0B0FF',
        fontWeight: '500',
    },
    chart: {
        height: 220,
        width: Dimensions.get('window').width - 80,
    },
    legendContainer: {
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 12,
        borderRadius: 10,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 12,
    },
    legendText: {
        flex: 1,
    },
    legendLabel: {
        fontSize: 13,
        color: '#B0B0FF',
        marginBottom: 2,
    },
    legendValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    metricCard: {
        width: '48%',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    metricLabel: {
        fontSize: 12,
        color: '#B0B0FF',
        marginBottom: 6,
        fontWeight: '500',
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    metricSubtext: {
        fontSize: 11,
        color: '#8080C0',
    },
    summaryContainer: {
        marginHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    summaryContent: {
        gap: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    summaryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 10,
    },
    summaryLabel: {
        flex: 1,
        fontSize: 13,
        color: '#B0B0FF',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
}); 