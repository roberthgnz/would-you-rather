import { Heart, RefreshCw } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GameFinishedProps {
    matchPct: number;
    matchCount: number;
    totalResults: number;
    onReset: () => void;
    onLeave: () => void;
}

export function GameFinished({ matchPct, matchCount, totalResults, onReset, onLeave }: GameFinishedProps) {
    const getResultMsg = () => {
        if (matchPct >= 80) return { emoji: "🥰", title: "¡Almas gemelas!", msg: "Piensan igual" };
        if (matchPct >= 60) return { emoji: "💕", title: "¡Gran conexión!", msg: "Muy parecidos" };
        if (matchPct >= 40) return { emoji: "😊", title: "¡Buena sintonía!", msg: "Se entienden" };
        return { emoji: "🤔", title: "¡Interesante!", msg: "Perspectivas diferentes" };
    };

    const r = getResultMsg();

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.centerContent}>
                    <Text style={styles.emojiLarge}>{r.emoji}</Text>
                    <Text style={styles.resultTitle}>{r.title}</Text>
                    <Text style={styles.resultMsg}>{r.msg}</Text>
                    
                    <View style={styles.statsContainer}>
                        <View style={styles.statsRow}>
                            <Heart size={24} color="#DB2777" fill="#DB2777" />
                            <Text style={styles.matchPct}>{matchPct}%</Text>
                        </View>
                        <Text style={styles.matchText}>Coincidieron en {matchCount} de {totalResults}</Text>
                    </View>
                    
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity onPress={onReset} style={[styles.button, styles.primaryButton]}>
                            <RefreshCw size={18} color="white" />
                            <Text style={styles.primaryButtonText}>Jugar de nuevo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onLeave} style={[styles.button, styles.secondaryButton]}>
                            <Text style={styles.secondaryButtonText}>Salir</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        width: '100%',
    },
    centerContent: {
        alignItems: 'center',
    },
    emojiLarge: {
        fontSize: 60,
        marginBottom: 16,
    },
    resultTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    resultMsg: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 16,
    },
    statsContainer: {
        backgroundColor: '#FDF2F8',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        width: '100%',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    matchPct: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#DB2777',
    },
    matchText: {
        fontSize: 14,
        color: '#BE185D',
    },
    actionsContainer: {
        width: '100%',
        gap: 8,
    },
    button: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    primaryButton: {
        backgroundColor: '#EC4899',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: '#E5E7EB',
    },
    secondaryButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
