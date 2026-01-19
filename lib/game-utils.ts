export function generateRoomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomId = '';
    for (let i = 0; i < 6; i++) {
        roomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return roomId;
}

export function validateRoomId(roomId: string): boolean {
    if (typeof roomId !== 'string') return false;
    return /^[A-Z0-9]{6}$/.test(roomId.toUpperCase());
}

export function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export function getRandomItems<T>(array: T[], count: number): T[] {
    return shuffleArray(array).slice(0, count);
}
