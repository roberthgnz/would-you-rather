import { getGameRoomManager } from '@/lib/rooms/game-room';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const { roomId, playerId, answer } = await request.json();
        if (!roomId || !playerId || (answer !== 'A' && answer !== 'B')) {
            return Response.json({ error: 'Invalid' }, { status: 400 });
        }

        const manager = getGameRoomManager();
        const updatedRoom = manager.recordAnswer(roomId, playerId, answer);
        if (!updatedRoom) return Response.json({ error: 'Failed' }, { status: 400 });

        const hostVoted = updatedRoom.hostAnswer !== null;
        const guestVoted = updatedRoom.guestAnswer !== null;

        await supabaseServer.channel(`game-${roomId}`).send({
            type: 'broadcast',
            event: 'player-voted',
            payload: { hostVoted, guestVoted, bothVoted: hostVoted && guestVoted }
        });

        return Response.json({ success: true, bothVoted: hostVoted && guestVoted });
    } catch (error) {
        console.error('Error voting:', error);
        return Response.json({ error: 'Failed' }, { status: 500 });
    }
}
