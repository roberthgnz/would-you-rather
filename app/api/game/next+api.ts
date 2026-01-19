import { getGameRoomManager } from '@/lib/rooms/game-room';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const { roomId, playerId } = await request.json();
        if (!roomId || !playerId) return Response.json({ error: 'Missing' }, { status: 400 });

        const manager = getGameRoomManager();
        const updatedRoom = manager.nextQuestion(roomId);
        if (!updatedRoom) return Response.json({ error: 'Failed' }, { status: 400 });

        const isFinished = updatedRoom.status === 'finished';

        if (isFinished) {
            await supabaseServer.channel(`game-${roomId}`).send({
                type: 'broadcast',
                event: 'game-over',
                payload: { results: updatedRoom.results }
            });
        } else {
            await supabaseServer.channel(`game-${roomId}`).send({
                type: 'broadcast',
                event: 'next-question',
                payload: { currentQuestionIndex: updatedRoom.currentQuestionIndex }
            });
        }

        return Response.json({ success: true, isFinished });
    } catch (error) {
        console.error('Error next:', error);
        return Response.json({ error: 'Failed' }, { status: 500 });
    }
}
