import { pusherServer } from '@/lib/pusher';
import { getWYRRoomManager } from '@/lib/rooms/wyr-room';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { roomId, playerId } = body;

        if (!roomId || typeof roomId !== 'string') {
            return Response.json(
                { success: false, error: 'roomId is required' },
                { status: 400 }
            );
        }

        if (!playerId || typeof playerId !== 'string') {
            return Response.json(
                { success: false, error: 'playerId is required' },
                { status: 400 }
            );
        }

        // Remove player from room
        const roomManager = getWYRRoomManager();
        roomManager.leave(roomId, playerId);

        // Notify other players that this player has disconnected
        await pusherServer.trigger(`game-${roomId}`, 'player-disconnected', {
            playerId,
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error notifying player leave:', error);
        return Response.json(
            { success: false, error: 'Failed to notify player leave' },
            { status: 500 }
        );
    }
}
