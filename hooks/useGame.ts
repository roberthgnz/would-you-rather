import { useRouter } from 'expo-router';
import { useState } from 'react';
import { API_URL } from '../constants/api';
import type { Question } from '../types';

export type GameMode = "lobby" | "waiting" | "game";

export interface MultiplayerState {
    roomId: string;
    playerId: string;
    isHost: boolean;
    questions: Question[];
    opponentConnected: boolean;
}

export function useGame() {
    const router = useRouter();
    const [gameMode, setGameMode] = useState<GameMode>("lobby");
    const [state, setState] = useState<MultiplayerState | null>(null);

    const handleRoomCreated = (roomId: string, playerId: string) => {
        setState({ roomId, playerId, isHost: true, questions: [], opponentConnected: false });
        setGameMode("waiting");
    };

    const handleRoomJoined = (roomId: string, playerId: string, questions: Question[]) => {
        setState({ roomId, playerId, isHost: false, questions, opponentConnected: true });
        setGameMode("game");
    };

    const handleGameStart = (questions: Question[]) => {
        if (state) {
            setState({ ...state, questions, opponentConnected: true });
            setGameMode("game");
        }
    };

    const handleLeave = () => {
        if (state?.roomId && state?.playerId) {
            fetch(`${API_URL}/api/game/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: state.roomId, playerId: state.playerId }),
            }).catch(() => { });
        }
        setState(null);
        setGameMode("lobby");
    };

    const handleBack = () => {
        router.back();
    };

    return {
        gameMode,
        state,
        handleRoomCreated,
        handleRoomJoined,
        handleGameStart,
        handleLeave,
        handleBack,
    };
}
