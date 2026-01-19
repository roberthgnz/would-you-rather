import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { WYRAnswer } from '../../types';

interface RoundResultProps {
    myDisplayAnswer: WYRAnswer;
    opponentDisplayAnswer: WYRAnswer;
    isHost: boolean;
    currentQuestionIndex: number;
    totalQuestions: number;
    onNext: () => void;
}

export function RoundResult({
    myDisplayAnswer,
    opponentDisplayAnswer,
    isHost,
    currentQuestionIndex,
    totalQuestions,
    onNext,
}: RoundResultProps) {
    const isMatch = myDisplayAnswer === opponentDisplayAnswer;

    return (
        <View style={[styles.resultCard, isMatch ? styles.bgGreen100 : styles.bgAmber100]}>
            <Text style={styles.emojiMedium}>{isMatch ? '🎉' : '😅'}</Text>
            <Text style={styles.resultCardTitle}>{isMatch ? '¡Coinciden!' : '¡Piensan diferente!'}</Text>
            {isHost ? (
                <TouchableOpacity onPress={onNext} style={[styles.button, styles.primaryButton, styles.marginTop]}>
                    <Text style={styles.primaryButtonText}>
                        {currentQuestionIndex < totalQuestions - 1 ? 'Siguiente' : 'Ver resultados'}
                    </Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.waitingHostText}>Esperando a que tu pareja continúe...</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    resultCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 2,
    },
    bgGreen100: { backgroundColor: '#D1FAE5', borderColor: '#6EE7B7' },
    bgAmber100: { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' },
    emojiMedium: {
        fontSize: 30,
        marginBottom: 8,
    },
    resultCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
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
    marginTop: {
        marginTop: 16,
    },
    waitingHostText: {
        marginTop: 16,
        fontSize: 14,
        color: '#6B7280',
    },
});
