import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL } from '../constants/api';
import type { WYRAnswer, WYRQuestion, WYRRoundResult } from '../types';

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

    const callbacksRef = useRef({ onOpponentJoined, onOpponentDisconnected, onGameOver });

    useEffect(() => { callbacksRef.current = { onOpponentJoined, onOpponentDisconnected, onGameOver }; });
    useEffect(() => { if (initialQuestions.length > 0) setQuestions(initialQuestions); }, [initialQuestions]);

    const currentQuestion = questions[currentQuestionIndex] || null;
    const bothVoted = myAnswer !== null && opponentVoted;

    useEffect(() => {
        const initSupabaseRealtime = async () => {
            try {
                const channel = supabase.channel(`game-${roomId}`, {
                    config: {
                        presence: {
                            key: playerId
                        }
                    }
                });

                channel
                    .on('broadcast', { event: 'player-joined' }, (payload: any) => {
                        setQuestions(payload.payload.room.questions);
                        setOpponentConnected(true);
                        callbacksRef.current.onOpponentJoined?.();
                    })
                    .on('broadcast', { event: 'player-voted' }, (payload: any) => {
                        setOpponentVoted(isHost ? payload.payload.guestVoted : payload.payload.hostVoted);
                        if (payload.payload.bothVoted && isHost) {
                            fetch(`${API_URL}/api/pusher/wyr/reveal`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ roomId, playerId }),
                            }).catch(() => { });
                        }
                    })
                    .on('broadcast', { event: 'result-revealed' }, (payload: any) => {
                        setHostAnswer(payload.payload.hostAnswer);
                        setGuestAnswer(payload.payload.guestAnswer);
                        setResults(payload.payload.results);
                        setShowingResult(true);
                    })
                    .on('broadcast', { event: 'next-question' }, (payload: any) => {
                        setCurrentQuestionIndex(payload.payload.currentQuestionIndex);
                        setMyAnswer(null);
                        setOpponentVoted(false);
                        setShowingResult(false);
                        setHostAnswer(null);
                        setGuestAnswer(null);
                    })
                    .on('broadcast', { event: 'game-over' }, (payload: any) => {
                        setResults(payload.payload.results);
                        setIsFinished(true);
                        callbacksRef.current.onGameOver?.(payload.payload.results);
                    })
                    .on('broadcast', { event: 'game-reset' }, (payload: any) => {
                        setQuestions(payload.payload.questions);
                        setCurrentQuestionIndex(0);
                        setMyAnswer(null);
                        setOpponentVoted(false);
                        setShowingResult(false);
                        setHostAnswer(null);
                        setGuestAnswer(null);
                        setResults([]);
                        setIsFinished(false);
                    })
                    .on('presence', { event: 'sync' }, () => {
                        const state = channel.presenceState();
                        const members = Object.keys(state);
                        const opponentConnected = members.some(memberId => memberId !== playerId);
                        setOpponentConnected(opponentConnected);
                        if (opponentConnected) {
                            callbacksRef.current.onOpponentJoined?.();
                        }
                    })
                    .on('presence', { event: 'join' }, ({ key }: { key: string }) => {
                        if (key !== playerId) {
                            setOpponentConnected(true);
                            callbacksRef.current.onOpponentJoined?.();
                        }
                    })
                    .on('presence', { event: 'leave' }, ({ key }: { key: string }) => {
                        if (key !== playerId) {
                            setOpponentConnected(false);
                            callbacksRef.current.onOpponentDisconnected?.();
                        }
                    })
                    .subscribe((status: string) => {
                        setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
                    });

                await channel.subscribe();

            } catch (e) {
                console.error('Supabase Realtime init error', e);
            }
        };

        initSupabaseRealtime();

        return () => {
            const cleanup = async () => {
                try {
                    const channel = supabase.channel(`game-${roomId}`);
                    await channel.unsubscribe();
                } catch (e) {
                    console.error('Cleanup error', e);
                }
            };
            cleanup();
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
        const channel = supabase.channel(`game-${roomId}`);
        channel.unsubscribe();
    }, [roomId, playerId]);

    return {
        questions, currentQuestionIndex, currentQuestion, myAnswer, opponentVoted, bothVoted,
        showingResult, hostAnswer, guestAnswer, results, isFinished, connectionStatus, opponentConnected,
        vote, nextQuestion, resetGame, leaveGame,
    };
}
