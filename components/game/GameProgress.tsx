import { Heart } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface GameProgressProps {
    currentIndex: number;
    total: number;
    matchCount: number;
}

export function GameProgress({ currentIndex, total, matchCount }: GameProgressProps) {
    return (
        <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
                <Text style={styles.progressText}>Pregunta {currentIndex + 1} de {total}</Text>
                <View style={styles.matchInfo}>
                    <Heart size={14} color="#EC4899" fill="#EC4899" />
                    <Text style={styles.matchCountText}>{matchCount} coincidencias</Text>
                </View>
            </View>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / total) * 100}%` }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    progressSection: {
        marginBottom: 16,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressText: {
        fontSize: 14,
        color: '#4B5563',
    },
    matchInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    matchCountText: {
        fontSize: 14,
        color: '#4B5563',
    },
    progressBarBg: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#EC4899',
        borderRadius: 4,
    },
});
