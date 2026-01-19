import { useState, useEffect, useCallback, useRef } from 'react';
import Pusher, { Channel, PresenceChannel } from 'pusher-js';
import { PUSHER_CONFIG, API_URL } from '../constants/api';
import type { WYRQuestion, WYRAnswer, WYRRoundResult } from '../types';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface UseWYRMultiplayerOptions {
    roomId: string;
    playerId: string;
    isHost: boolean;
    initialQuestions?: WYRQuestion[];
    initialOpponentConnected?: boolean;
    onOpponentJoined?: () => void;
    onOpponentDisconnected?: () => void;
    onGameOver?: (results: WYRRoundResult[]) => void;
}

export function useWYRMultiplayer({
    roomId,
    playerId,
    isHost,
    initialQuestions = [],
    initialOpponentConnected = false,
    onOpponentJoined,
    onOpponentDisconnected,
    onGameOver,
}: UseWYRMultiplayerOptions) {
    const [questions, setQuestions] = useState<WYRQuestion[]>(initialQuestions);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [myAnswer, setMyAnswer] = useState<WYRAnswer>(null);
    const [opponentVoted, setOpponentVoted] = useState(false);
    const [showingResult, setShowingResult] = useState(false);
    const [hostAnswer, setHostAnswer] = useState<WYRAnswer>(null);
    const [guestAnswer, setGuestAnswer] = useState<WYRAnswer>(null);
    const [results, setResults] = useState<WYRRoundResult[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
    const [opponentConnected, setOpponentConnected] = useState(initialOpponentConnected);

    const pusherRef = useRef<Pusher | null>(null);
    const callbacksRef = useRef({ onOpponentJoined, onOpponentDisconnected, onGameOver });

    useEffect(() => { callbacksRef.current = { onOpponentJoined, onOpponentDisconnected, onGameOver }; });
    useEffect(() => { if (initialQuestions.length > 0) setQuestions(initialQuestions); }, [initialQuestions]);

    const currentQuestion = questions[currentQuestionIndex] || null;
    const bothVoted = myAnswer !== null && opponentVoted;

    useEffect(() => {
        const pusher = new Pusher(PUSHER_CONFIG.key, {
            cluster: PUSHER_CONFIG.cluster,
            authEndpoint: `${API_URL}/api/pusher/auth`,
            auth: { headers: { 'x-user-id': playerId, 'x-user-symbol': isHost ? 'host' : 'guest' } },
        });
        pusherRef.current = pusher;

        const channel = pusher.subscribe(`game-${roomId}`);
        const presence = pusher.subscribe(`presence-game-${roomId}`) as PresenceChannel;

        pusher.connection.bind('connected', () => setConnectionStatus('connected'));
        pusher.connection.bind('disconnected', () => setConnectionStatus('disconnected'));

        presence.bind('pusher:subscription_succeeded', () => setOpponentConnected(presence.members.count > 1));
        presence.bind('pusher:member_added', () => { setOpponentConnected(true); callbacksRef.current.onOpponentJoined?.(); });
        presence.bind('pusher:member_removed', () => {
            if (presence.members.count <= 1) { setOpponentConnected(false); callbacksRef.current.onOpponentDisconnected?.(); }
        });

        channel.bind('player-joined', (data: { room: { questions: WYRQuestion[] } }) => {
            setQuestions(data.room.questions);
            setOpponentConnected(true);
            callbacksRef.current.onOpponentJoined?.();
        });

        channel.bind('player-voted', (data: { hostVoted: boolean; guestVoted: boolean; bothVoted: boolean }) => {
            setOpponentVoted(isHost ? data.guestVoted : data.hostVoted);
            if (data.bothVoted && isHost) {
                fetch(`${API_URL}/api/pusher/wyr/reveal`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomId, playerId }),
                }).catch(() => { });
            }
        });

        channel.bind('result-revealed', (data: { hostAnswer: WYRAnswer; guestAnswer: WYRAnswer; results: WYRRoundResult[] }) => {
            setHostAnswer(data.hostAnswer);
            setGuestAnswer(data.guestAnswer);
            setResults(data.results);
            setShowingResult(true);
        });

        channel.bind('next-question', (data: { currentQuestionIndex: number }) => {
            setCurrentQuestionIndex(data.currentQuestionIndex);
            setMyAnswer(null);
            setOpponentVoted(false);
            setShowingResult(false);
            setHostAnswer(null);
            setGuestAnswer(null);
        });

        channel.bind('game-over', (data: { results: WYRRoundResult[] }) => {
            setResults(data.results);
            setIsFinished(true);
            callbacksRef.current.onGameOver?.(data.results);
        });

        channel.bind('game-reset', (data: { questions: WYRQuestion[] }) => {
            setQuestions(data.questions);
            setCurrentQuestionIndex(0);
            setMyAnswer(null);
            setOpponentVoted(false);
            setShowingResult(false);
            setHostAnswer(null);
            setGuestAnswer(null);
            setResults([]);
            setIsFinished(false);
        });

        return () => {
            channel.unbind_all();
            presence.unbind_all();
            pusher.unsubscribe(`game-${roomId}`);
            pusher.unsubscribe(`presence-game-${roomId}`);
            pusher.disconnect();
        };
    }, [roomId, playerId, isHost]);

    const vote = useCallback(async (answer: WYRAnswer): Promise<boolean> => {
        if (myAnswer !== null || !answer) return false;
        try {
            const res = await fetch(`${API_URL}/api/pusher/wyr/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, playerId, answer }),
            });
            if (res.ok) { setMyAnswer(answer); return true; }
            return false;
        } catch { return false; }
    }, [roomId, playerId, myAnswer]);

    const nextQuestion = useCallback(async (): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/api/pusher/wyr/next`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, playerId }),
            });
            return res.ok;
        } catch { return false; }
    }, [roomId, playerId]);

    const resetGame = useCallback(async (): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/api/pusher/wyr/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, playerId }),
            });
            return res.ok;
        } catch { return false; }
    }, [roomId, playerId]);

    const leaveGame = useCallback(() => {
        fetch(`${API_URL}/api/pusher/leave`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId, playerId }) }).catch(() => { });
        pusherRef.current?.disconnect();
    }, [roomId, playerId]);

    return {
        questions, currentQuestionIndex, currentQuestion, myAnswer, opponentVoted, bothVoted,
        showingResult, hostAnswer, guestAnswer, results, isFinished, connectionStatus, opponentConnected,
        vote, nextQuestion, resetGame, leaveGame,
    };
}
