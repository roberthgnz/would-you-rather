import { getWYRRoomManager } from '@/lib/rooms/wyr-room';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
    try {
        const { roomId, playerId, answer } = await request.json();
        if (!roomId || !playerId || (answer !== 'A' && answer !== 'B')) {
            return Response.json({ error: 'Invalid' }, { status: 400 });
        }

        const manager = getWYRRoomManager();
        const updatedRoom = manager.recordAnswer(roomId, playerId, answer);
        if (!updatedRoom) return Response.json({ error: 'Failed' }, { status: 400 });

        const hostVoted = updatedRoom.hostAnswer !== null;
        const guestVoted = updatedRoom.guestAnswer !== null;

        await pusherServer.trigger(`game-${roomId}`, 'player-voted', { hostVoted, guestVoted, bothVoted: hostVoted && guestVoted });

        return Response.json({ success: true, bothVoted: hostVoted && guestVoted });
    } catch (error) {
        console.error('Error voting:', error);
        return Response.json({ error: 'Failed' }, { status: 500 });
    }
}
