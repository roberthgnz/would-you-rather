import { getWYRRoomManager } from '@/lib/rooms/wyr-room';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
    try {
        const { roomId, playerId } = await request.json();
        if (!roomId || !playerId) return Response.json({ error: 'Missing' }, { status: 400 });

        const manager = getWYRRoomManager();
        const updatedRoom = manager.revealResult(roomId);
        if (!updatedRoom) return Response.json({ error: 'Cannot reveal' }, { status: 400 });

        await pusherServer.trigger(`game-${roomId}`, 'result-revealed', {
            hostAnswer: updatedRoom.hostAnswer,
            guestAnswer: updatedRoom.guestAnswer,
            results: updatedRoom.results,
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error revealing:', error);
        return Response.json({ error: 'Failed' }, { status: 500 });
    }
}
