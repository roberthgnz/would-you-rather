import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import MultiplayerGame from '../components/MultiplayerGame';
import WYRMultiplayerLobby from '../components/MultiplayerLobby';
import WaitingRoom from '../components/WaitingRoom';
import { API_URL } from '../constants/api';
import type { WYRQuestion } from '../types';

type GameMode = "lobby" | "waiting" | "game";

interface MultiplayerState {
    roomId: string;
    playerId: string;
    isHost: boolean;
    questions: WYRQuestion[];
    opponentConnected: boolean;
}

export default function WYRScreen() {
    const router = useRouter();
    const [gameMode, setGameMode] = useState<GameMode>("lobby");
    const [state, setState] = useState<MultiplayerState | null>(null);

    const handleRoomCreated = (roomId: string, playerId: string) => {
        setState({ roomId, playerId, isHost: true, questions: [], opponentConnected: false });
        setGameMode("waiting");
    };

    const handleRoomJoined = (roomId: string, playerId: string, questions: WYRQuestion[]) => {
        setState({ roomId, playerId, isHost: false, questions, opponentConnected: true });
        setGameMode("game");
    };

    const handleGameStart = (questions: WYRQuestion[]) => {
        if (state) {
            setState({ ...state, questions, opponentConnected: true });
            setGameMode("game");
        }
    };

    const handleLeave = () => {
        if (state?.roomId && state?.playerId) {
            fetch(`${API_URL}/api/pusher/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: state.roomId, playerId: state.playerId }),
            }).catch(() => { });
        }
        setState(null);
        setGameMode("lobby");
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />
            
            <LinearGradient
                colors={['#FCE7F3', '#FECACA']} // pink-100 to red-200
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    {gameMode === "lobby" && (
                        <WYRMultiplayerLobby 
                            onRoomCreated={handleRoomCreated} 
                            onRoomJoined={handleRoomJoined} 
                            onBack={() => router.back()} 
                        />
                    )}
                    {gameMode === "waiting" && state && (
                        <WaitingRoom 
                            roomId={state.roomId} 
                            playerId={state.playerId} 
                            onGameStart={handleGameStart} 
                            onCancel={handleLeave} 
                        />
                    )}
                    {gameMode === "game" && state && (
                        <MultiplayerGame 
                            roomId={state.roomId} 
                            playerId={state.playerId} 
                            isHost={state.isHost}
                            initialQuestions={state.questions} 
                            initialOpponentConnected={state.opponentConnected} 
                            onLeave={handleLeave} 
                        />
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});
