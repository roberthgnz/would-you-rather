import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft, RefreshCw, Heart, Wifi, WifiOff, Check, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useWYRMultiplayer } from '../hooks/useWYRMultiplayer';
import type { WYRQuestion, WYRAnswer } from '../types';

interface Props {
    roomId: string;
    playerId: string;
    isHost: boolean;
    initialQuestions?: WYRQuestion[];
    initialOpponentConnected: boolean;
    onLeave: () => void;
}

export default function MultiplayerGame({ roomId, playerId, isHost, initialQuestions = [], initialOpponentConnected, onLeave }: Props) {
    const {
        questions, currentQuestionIndex, currentQuestion, myAnswer, opponentVoted, bothVoted,
        showingResult, hostAnswer, guestAnswer, results, isFinished, connectionStatus, opponentConnected,
        vote, nextQuestion, resetGame, leaveGame,
    } = useWYRMultiplayer({
        roomId, playerId, isHost, initialQuestions, initialOpponentConnected,
        onOpponentJoined: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
        onOpponentDisconnected: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
        onGameOver: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    });

    const handleVote = async (answer: WYRAnswer) => {
        if (myAnswer || showingResult || !answer) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const success = await vote(answer);
        if (!success) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    };

    const handleNext = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await nextQuestion();
    };

    const handleReset = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await resetGame();
    };

    const handleLeave = () => { leaveGame(); onLeave(); };

    const matchCount = results.filter(r => r.match).length;
    const matchPct = results.length > 0 ? Math.round((matchCount / results.length) * 100) : 0;
    const myDisplayAnswer = isHost ? hostAnswer : guestAnswer;
    const opponentDisplayAnswer = isHost ? guestAnswer : hostAnswer;

    const getResultMsg = () => {
        if (matchPct >= 80) return { emoji: "🥰", title: "¡Almas gemelas!", msg: "Piensan igual" };
        if (matchPct >= 60) return { emoji: "💕", title: "¡Gran conexión!", msg: "Muy parecidos" };
        if (matchPct >= 40) return { emoji: "😊", title: "¡Buena sintonía!", msg: "Se entienden" };
        return { emoji: "🤔", title: "¡Interesante!", msg: "Perspectivas diferentes" };
    };

    if (isFinished) {
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
                            <Text style={styles.matchText}>Coincidieron en {matchCount} de {results.length}</Text>
                        </View>
                        
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity onPress={handleReset} style={[styles.button, styles.primaryButton]}>
                                <RefreshCw size={18} color="white" />
                                <Text style={styles.primaryButtonText}>Jugar de nuevo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleLeave} style={[styles.button, styles.secondaryButton]}>
                                <Text style={styles.secondaryButtonText}>Salir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={handleLeave} style={styles.backButton}>
                    <ArrowLeft size={20} color="#4B5563" />
                    <Text style={styles.backButtonText}>Salir</Text>
                </TouchableOpacity>
                <View style={styles.connectionStatus}>
                    {connectionStatus === 'connected' ? <Wifi size={16} color="#10B981" /> : <WifiOff size={16} color="#EF4444" />}
                    <Text style={[styles.statusText, { color: opponentConnected ? '#059669' : '#D97706' }]}>
                        {opponentConnected ? 'Conectados' : 'Esperando...'}
                    </Text>
                </View>
            </View>

            <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>Pregunta {currentQuestionIndex + 1} de {questions.length}</Text>
                    <View style={styles.matchInfo}>
                        <Heart size={14} color="#EC4899" fill="#EC4899" />
                        <Text style={styles.matchCountText}>{matchCount} coincidencias</Text>
                    </View>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }]} />
                </View>
            </View>

            {currentQuestion && (
                <View style={styles.questionCard}>
                    <Text style={styles.questionTitle}>¿Qué prefieres?</Text>

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity
                            onPress={() => handleVote('A')}
                            disabled={!!myAnswer || showingResult}
                            style={[
                                styles.optionButton,
                                showingResult && myDisplayAnswer === 'A' ? styles.optionSelectedPink :
                                myAnswer === 'A' ? styles.optionSelectedPink :
                                myAnswer ? styles.optionDisabled : styles.optionPink
                            ]}
                        >
                            <Text style={[styles.optionLabel, { color: '#EC4899' }]}>A.</Text>
                            <Text style={styles.optionText}>{currentQuestion.optionA}</Text>
                            {showingResult && opponentDisplayAnswer === 'A' && (
                                <View style={styles.partnerBadge}>
                                    <Text style={styles.partnerBadgeText}>👤 Pareja</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.orText}>o</Text>

                        <TouchableOpacity
                            onPress={() => handleVote('B')}
                            disabled={!!myAnswer || showingResult}
                            style={[
                                styles.optionButton,
                                showingResult && myDisplayAnswer === 'B' ? styles.optionSelectedPurple :
                                myAnswer === 'B' ? styles.optionSelectedPurple :
                                myAnswer ? styles.optionDisabled : styles.optionPurple
                            ]}
                        >
                            <Text style={[styles.optionLabel, { color: '#A855F7' }]}>B.</Text>
                            <Text style={styles.optionText}>{currentQuestion.optionB}</Text>
                            {showingResult && opponentDisplayAnswer === 'B' && (
                                <View style={styles.partnerBadge}>
                                    <Text style={styles.partnerBadgeText}>👤 Pareja</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={styles.partnerStatusCard}>
                <View style={styles.partnerStatusRow}>
                    <Text style={styles.partnerLabel}>Tu pareja</Text>
                    {showingResult ? (
                        <View style={[styles.statusBadge, opponentDisplayAnswer === 'A' ? styles.bgPink100 : styles.bgPurple100]}>
                            <Text style={[styles.statusBadgeText, opponentDisplayAnswer === 'A' ? styles.textPink700 : styles.textPurple700]}>
                                Opción {opponentDisplayAnswer}
                            </Text>
                        </View>
                    ) : opponentVoted ? (
                        <View style={styles.statusRow}>
                            <Check size={14} color="#059669" />
                            <Text style={styles.textGreen600}>Ha votado</Text>
                        </View>
                    ) : (
                        <View style={styles.statusRow}>
                            <Clock size={14} color="#D97706" />
                            <Text style={styles.textAmber600}>Esperando...</Text>
                        </View>
                    )}
                </View>
            </View>

            {showingResult ? (
                <View style={[styles.resultCard, myDisplayAnswer === opponentDisplayAnswer ? styles.bgGreen100 : styles.bgAmber100]}>
                    <Text style={styles.emojiMedium}>{myDisplayAnswer === opponentDisplayAnswer ? '🎉' : '😅'}</Text>
                    <Text style={styles.resultCardTitle}>{myDisplayAnswer === opponentDisplayAnswer ? '¡Coinciden!' : '¡Piensan diferente!'}</Text>
                    {isHost ? (
                        <TouchableOpacity onPress={handleNext} style={[styles.button, styles.primaryButton, styles.marginTop]}>
                            <Text style={styles.primaryButtonText}>
                                {currentQuestionIndex < questions.length - 1 ? 'Siguiente' : 'Ver resultados'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.waitingHostText}>Esperando a que tu pareja continúe...</Text>
                    )}
                </View>
            ) : bothVoted ? (
                <Text style={styles.statusTextCenter}>Revelando resultado...</Text>
            ) : (
                <Text style={styles.statusTextCenter}>{myAnswer ? 'Esperando a tu pareja...' : 'Elige una opción'}</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backButtonText: {
        color: '#4B5563',
        fontSize: 16,
    },
    connectionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusText: {
        fontSize: 12,
    },
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
        color: '#1F2937', // Default, override in render if needed (e.g. for selected)
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
    partnerStatusCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    partnerStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    partnerLabel: {
        fontWeight: 'bold',
        color: '#374151',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9999,
    },
    statusBadgeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    bgPink100: { backgroundColor: '#FCE7F3' },
    bgPurple100: { backgroundColor: '#F3E8FF' },
    textPink700: { color: '#BE185D' },
    textPurple700: { color: '#7E22CE' },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    textGreen600: { color: '#059669', fontSize: 14 },
    textAmber600: { color: '#D97706', fontSize: 14 },
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
    waitingHostText: {
        marginTop: 16,
        fontSize: 14,
        color: '#6B7280',
    },
    statusTextCenter: {
        textAlign: 'center',
        color: '#6B7280',
        paddingVertical: 12,
    },
    
    // Finished Screen Styles
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
    marginTop: {
        marginTop: 16,
    },
});
