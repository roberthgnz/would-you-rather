import type { BaseRoom, IGameRoomFactory } from './types';
import { BaseRoomManager } from './base-room-manager';
import { InMemoryRoomStorage } from './storage';

export type WYRCategory = 'divertido' | 'romantico' | 'aventura' | 'comida' | 'random';

export interface WYRQuestion {
    id: number;
    optionA: string;
    optionB: string;
    category: WYRCategory;
}

export type WYRAnswer = 'A' | 'B' | null;

export interface WYRRoundResult {
    questionId: number;
    hostAnswer: WYRAnswer;
    guestAnswer: WYRAnswer;
    match: boolean;
}

export interface WYRRoom extends BaseRoom {
    gameType: 'wyr';
    questions: WYRQuestion[];
    currentQuestionIndex: number;
    hostAnswer: WYRAnswer;
    guestAnswer: WYRAnswer;
    results: WYRRoundResult[];
    showingResult: boolean;
}

export class WYRRoomFactory implements IGameRoomFactory<WYRRoom> {
    gameType = 'wyr' as const;

    createInitialState(hostId: string, roomId: string): WYRRoom {
        const now = Date.now();
        return {
            id: roomId,
            gameType: 'wyr',
            hostId,
            guestId: null,
            questions: [],
            currentQuestionIndex: 0,
            hostAnswer: null,
            guestAnswer: null,
            results: [],
            showingResult: false,
            status: 'waiting',
            createdAt: now,
            lastActivity: now,
        };
    }

    resetGameState(_room: WYRRoom): Partial<WYRRoom> {
        return {
            currentQuestionIndex: 0,
            hostAnswer: null,
            guestAnswer: null,
            results: [],
            showingResult: false,
            status: 'playing',
        };
    }
}

export class WYRRoomManager extends BaseRoomManager<WYRRoom> {
    constructor() {
        super(new InMemoryRoomStorage<WYRRoom>(), new WYRRoomFactory());
    }

    setQuestions(roomId: string, questions: WYRQuestion[]): WYRRoom | null {
        return this.update(roomId, { questions });
    }

    recordAnswer(roomId: string, playerId: string, answer: WYRAnswer): WYRRoom | null {
        const room = this.getRoom(roomId);
        if (!room) return null;

        const role = this.getPlayerRole(room, playerId);
        if (!role) return null;

        const updates: Partial<WYRRoom> = {};
        if (role === 'host') updates.hostAnswer = answer;
        else updates.guestAnswer = answer;

        return this.update(roomId, updates);
    }

    bothAnswered(room: WYRRoom): boolean {
        return room.hostAnswer !== null && room.guestAnswer !== null;
    }

    revealResult(roomId: string): WYRRoom | null {
        const room = this.getRoom(roomId);
        if (!room || !this.bothAnswered(room)) return null;

        const question = room.questions[room.currentQuestionIndex];
        const match = room.hostAnswer === room.guestAnswer;

        const result: WYRRoundResult = {
            questionId: question.id,
            hostAnswer: room.hostAnswer,
            guestAnswer: room.guestAnswer,
            match,
        };

        return this.update(roomId, {
            results: [...room.results, result],
            showingResult: true,
        });
    }

    nextQuestion(roomId: string): WYRRoom | null {
        const room = this.getRoom(roomId);
        if (!room) return null;

        const nextIndex = room.currentQuestionIndex + 1;
        const isFinished = nextIndex >= room.questions.length;

        return this.update(roomId, {
            currentQuestionIndex: nextIndex,
            hostAnswer: null,
            guestAnswer: null,
            showingResult: false,
            status: isFinished ? 'finished' : 'playing',
        });
    }
}

const globalForRooms = globalThis as unknown as { wyrRoomManager: WYRRoomManager | undefined };

export function getWYRRoomManager(): WYRRoomManager {
    if (!globalForRooms.wyrRoomManager) {
        globalForRooms.wyrRoomManager = new WYRRoomManager();
    }
    return globalForRooms.wyrRoomManager;
}
