export type RoomStatus = 'waiting' | 'playing' | 'paused' | 'finished';

export interface BaseRoom {
    id: string;
    gameType: string;
    hostId: string;
    guestId: string | null;
    status: RoomStatus;
    createdAt: number;
    lastActivity: number;
}

export interface IRoomStorage<T extends BaseRoom> {
    get(roomId: string): T | null;
    set(roomId: string, room: T): void;
    delete(roomId: string): boolean;
    has(roomId: string): boolean;
    getAll(): Map<string, T>;
}

export interface IRoomLifecycle<T extends BaseRoom> {
    create(hostId: string): T;
    join(roomId: string, guestId: string): T | null;
    leave(roomId: string, playerId: string): T | null;
    cleanup(): number;
}

export interface IRoomQueries<T extends BaseRoom> {
    getRoom(roomId: string): T | null;
    isRoomFull(room: T): boolean;
    getPlayerRole(room: T, playerId: string): 'host' | 'guest' | null;
    getActiveRoomCount(): number;
}

export interface IRoomManager<T extends BaseRoom>
    extends IRoomLifecycle<T>, IRoomQueries<T> {
    update(roomId: string, updates: Partial<T>): T | null;
}

export interface IGameRoomFactory<T extends BaseRoom> {
    gameType: string;
    createInitialState(hostId: string, roomId: string): T;
    resetGameState(room: T): Partial<T>;
}
