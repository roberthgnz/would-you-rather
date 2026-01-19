import * as Haptics from 'expo-haptics';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useWYRMultiplayer } from '../hooks/useWYRMultiplayer';
import type { WYRAnswer, WYRQuestion } from '../types';
import { GameFinished } from './game/GameFinished';
import { GameProgress } from './game/GameProgress';
import { GameTopBar } from './game/GameTopBar';
import { PartnerStatus } from './game/PartnerStatus';
import { QuestionCard } from './game/QuestionCard';
import { RoundResult } from './game/RoundResult';

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

    if (isFinished) {
        return (
            <GameFinished 
                matchPct={matchPct} 
                matchCount={matchCount} 
                totalResults={results.length} 
                onReset={handleReset} 
                onLeave={handleLeave} 
            />
        );
    }

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <GameTopBar 
                onLeave={handleLeave} 
                connectionStatus={connectionStatus} 
                opponentConnected={opponentConnected} 
            />

            <GameProgress 
                currentIndex={currentQuestionIndex} 
                total={questions.length} 
                matchCount={matchCount} 
            />

            {currentQuestion && (
                <QuestionCard 
                    question={currentQuestion} 
                    myAnswer={myAnswer} 
                    showingResult={showingResult} 
                    myDisplayAnswer={myDisplayAnswer} 
                    opponentDisplayAnswer={opponentDisplayAnswer} 
                    onVote={handleVote} 
                />
            )}

            <PartnerStatus 
                showingResult={showingResult} 
                opponentVoted={opponentVoted} 
                opponentDisplayAnswer={opponentDisplayAnswer} 
            />

            {showingResult ? (
                <RoundResult 
                    myDisplayAnswer={myDisplayAnswer} 
                    opponentDisplayAnswer={opponentDisplayAnswer} 
                    isHost={isHost} 
                    currentQuestionIndex={currentQuestionIndex} 
                    totalQuestions={questions.length} 
                    onNext={handleNext} 
                />
            ) : bothVoted ? (
                <Text style={styles.statusTextCenter}>Revelando resultado...</Text>
            ) : (
                <Text style={styles.statusTextCenter}>{myAnswer ? 'Esperando a tu pareja...' : 'Elige una opción'}</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    statusTextCenter: {
        textAlign: 'center',
        color: '#6B7280',
        paddingVertical: 12,
    },
});
