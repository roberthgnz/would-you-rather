import type { BaseRoom, IGameRoomFactory } from './types';
import { BaseRoomManager } from './base-room-manager';
import { InMemoryRoomStorage } from './storage';

export type GameCategory = 'divertido' | 'romantico' | 'aventura' | 'comida' | 'random';

export interface Question {
    id: number;
    optionA: string;
    optionB: string;
    category: GameCategory;
}

export type Answer = 'A' | 'B' | null;

export interface RoundResult {
    questionId: number;
    hostAnswer: Answer;
    guestAnswer: Answer;
    match: boolean;
}

export interface GameRoom extends BaseRoom {
    gameType: 'game';
    questions: Question[];
    currentQuestionIndex: number;
    hostAnswer: Answer;
    guestAnswer: Answer;
    results: RoundResult[];
    showingResult: boolean;
}

export class GameRoomFactory implements IGameRoomFactory<GameRoom> {
    gameType = 'game' as const;

    createInitialState(hostId: string, roomId: string): GameRoom {
        const now = Date.now();
        return {
            id: roomId,
            gameType: 'game',
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

    resetGameState(_room: GameRoom): Partial<GameRoom> {
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

export class GameRoomManager extends BaseRoomManager<GameRoom> {
    constructor() {
        super(new InMemoryRoomStorage<GameRoom>(), new GameRoomFactory());
    }

    setQuestions(roomId: string, questions: Question[]): GameRoom | null {
        return this.update(roomId, { questions });
    }

    recordAnswer(roomId: string, playerId: string, answer: Answer): GameRoom | null {
        const room = this.getRoom(roomId);
        if (!room) return null;

        const role = this.getPlayerRole(room, playerId);
        if (!role) return null;

        const updates: Partial<GameRoom> = {};
        if (role === 'host') updates.hostAnswer = answer;
        else updates.guestAnswer = answer;

        return this.update(roomId, updates);
    }

    bothAnswered(room: GameRoom): boolean {
        return room.hostAnswer !== null && room.guestAnswer !== null;
    }

    revealResult(roomId: string): GameRoom | null {
        const room = this.getRoom(roomId);
        if (!room || !this.bothAnswered(room)) return null;

        const question = room.questions[room.currentQuestionIndex];
        const match = room.hostAnswer === room.guestAnswer;

        const result: RoundResult = {
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

    nextQuestion(roomId: string): GameRoom | null {
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

const globalForRooms = globalThis as unknown as { gameRoomManager: GameRoomManager | undefined };

export function getGameRoomManager(): GameRoomManager {
    if (!globalForRooms.gameRoomManager) {
        globalForRooms.gameRoomManager = new GameRoomManager();
    }
    return globalForRooms.gameRoomManager;
}
