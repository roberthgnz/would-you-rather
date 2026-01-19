import { generateRoomId } from '../game-utils';
import type { BaseRoom, IRoomManager, IRoomStorage, IGameRoomFactory } from './types';

const ROOM_EXPIRATION_MS = 30 * 60 * 1000;

export abstract class BaseRoomManager<T extends BaseRoom> implements IRoomManager<T> {
    protected storage: IRoomStorage<T>;
    protected factory: IGameRoomFactory<T>;

    constructor(storage: IRoomStorage<T>, factory: IGameRoomFactory<T>) {
        this.storage = storage;
        this.factory = factory;
    }

    create(hostId: string): T {
        let roomId = generateRoomId();
        while (this.storage.has(roomId)) {
            roomId = generateRoomId();
        }

        const room = this.factory.createInitialState(hostId, roomId);
        this.storage.set(roomId, room);
        return room;
    }

    join(roomId: string, guestId: string): T | null {
        const room = this.storage.get(roomId);
        if (!room) {
            return null;
        }

        if (room.guestId !== null && room.guestId !== guestId) {
            return null;
        }

        const updatedRoom: T = {
            ...room,
            guestId,
            status: 'playing' as const,
            lastActivity: Date.now(),
        };

        this.storage.set(roomId, updatedRoom);
        return updatedRoom;
    }

    leave(roomId: string, playerId: string): T | null {
        const room = this.storage.get(roomId);
        if (!room) return null;

        const role = this.getPlayerRole(room, playerId);
        if (!role) return null;

        if (role === 'host') {
            this.storage.delete(roomId);
            return null;
        }

        const updatedRoom: T = {
            ...room,
            guestId: null,
            status: 'waiting' as const,
            lastActivity: Date.now(),
        };

        this.storage.set(roomId, updatedRoom);
        return updatedRoom;
    }

    getRoom(roomId: string): T | null {
        return this.storage.get(roomId);
    }

    update(roomId: string, updates: Partial<T>): T | null {
        const room = this.storage.get(roomId);
        if (!room) return null;

        const { id, gameType, ...safeUpdates } = updates as Partial<T> & { id?: string; gameType?: string };

        const updatedRoom: T = {
            ...room,
            ...safeUpdates,
            lastActivity: Date.now(),
        };

        this.storage.set(roomId, updatedRoom);
        return updatedRoom;
    }

    isRoomFull(room: T): boolean {
        return room.guestId !== null;
    }

    getPlayerRole(room: T, playerId: string): 'host' | 'guest' | null {
        if (room.hostId === playerId) return 'host';
        if (room.guestId === playerId) return 'guest';
        return null;
    }

    getActiveRoomCount(): number {
        return this.storage.getAll().size;
    }

    cleanup(): number {
        const now = Date.now();
        let cleaned = 0;

        for (const [roomId, room] of this.storage.getAll().entries()) {
            if (now - room.lastActivity > ROOM_EXPIRATION_MS) {
                this.storage.delete(roomId);
                cleaned++;
            }
        }

        return cleaned;
    }

    resetGame(roomId: string): T | null {
        const room = this.storage.get(roomId);
        if (!room) return null;

        const resetUpdates = this.factory.resetGameState(room);
        return this.update(roomId, resetUpdates);
    }
}
