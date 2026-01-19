import type { BaseRoom, IRoomStorage } from './types';

export class InMemoryRoomStorage<T extends BaseRoom> implements IRoomStorage<T> {
    private rooms = new Map<string, T>();

    get(roomId: string): T | null {
        return this.rooms.get(roomId.toUpperCase()) || null;
    }

    set(roomId: string, room: T): void {
        this.rooms.set(roomId.toUpperCase(), room);
    }

    delete(roomId: string): boolean {
        return this.rooms.delete(roomId.toUpperCase());
    }

    has(roomId: string): boolean {
        return this.rooms.has(roomId.toUpperCase());
    }

    getAll(): Map<string, T> {
        return new Map(this.rooms);
    }
}
