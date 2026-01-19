import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { WYRAnswer, WYRQuestion } from '../../types';

interface QuestionCardProps {
    question: WYRQuestion;
    myAnswer: WYRAnswer;
    showingResult: boolean;
    myDisplayAnswer: WYRAnswer;
    opponentDisplayAnswer: WYRAnswer;
    onVote: (answer: WYRAnswer) => void;
}

export function QuestionCard({
    question,
    myAnswer,
    showingResult,
    myDisplayAnswer,
    opponentDisplayAnswer,
    onVote,
}: QuestionCardProps) {
    return (
        <View style={styles.questionCard}>
            <Text style={styles.questionTitle}>¿Qué prefieres?</Text>

            <View style={styles.optionsContainer}>
                <TouchableOpacity
                    onPress={() => onVote('A')}
                    disabled={!!myAnswer || showingResult}
                    style={[
                        styles.optionButton,
                        showingResult && myDisplayAnswer === 'A' ? styles.optionSelectedPink :
                        myAnswer === 'A' ? styles.optionSelectedPink :
                        myAnswer ? styles.optionDisabled : styles.optionPink
                    ]}
                >
                    <Text style={[styles.optionLabel, { color: '#EC4899' }]}>A.</Text>
                    <Text style={styles.optionText}>{question.optionA}</Text>
                    {showingResult && opponentDisplayAnswer === 'A' && (
                        <View style={styles.partnerBadge}>
                            <Text style={styles.partnerBadgeText}>👤 Pareja</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.orText}>o</Text>

                <TouchableOpacity
                    onPress={() => onVote('B')}
                    disabled={!!myAnswer || showingResult}
                    style={[
                        styles.optionButton,
                        showingResult && myDisplayAnswer === 'B' ? styles.optionSelectedPurple :
                        myAnswer === 'B' ? styles.optionSelectedPurple :
                        myAnswer ? styles.optionDisabled : styles.optionPurple
                    ]}
                >
                    <Text style={[styles.optionLabel, { color: '#A855F7' }]}>B.</Text>
                    <Text style={styles.optionText}>{question.optionB}</Text>
                    {showingResult && opponentDisplayAnswer === 'B' && (
                        <View style={styles.partnerBadge}>
                            <Text style={styles.partnerBadgeText}>👤 Pareja</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    questionCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    questionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 16,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionPink: {
        backgroundColor: '#FDF2F8',
    },
    optionPurple: {
        backgroundColor: '#FAF5FF',
    },
    optionSelectedPink: {
        backgroundColor: '#EC4899',
    },
    optionSelectedPurple: {
        backgroundColor: '#A855F7',
    },
    optionDisabled: {
        backgroundColor: '#F3F4F6',
    },
    optionLabel: {
        fontWeight: 'bold',
        marginRight: 8,
    },
    optionText: {
        fontSize: 16,
        flex: 1,
        color: '#1F2937',
    },
    orText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 14,
    },
    partnerBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 8,
    },
    partnerBadgeText: {
        fontSize: 12,
        color: '#1F2937',
    },
});
