import { getRandomQuestions } from '@/lib/data/game-questions';
import { getGameRoomManager, type Question } from '@/lib/rooms/game-room';
import { supabaseServer } from '@/lib/supabase-server';

function generateQuestions(): Question[] {
    const questions = getRandomQuestions(8);
    return questions.map((q, i) => ({ id: Date.now() + i, ...q }));
}

export async function POST(request: Request) {
    try {
        const { roomId, guestId } = await request.json();
        if (!roomId || !guestId) return Response.json({ error: 'Missing fields' }, { status: 400 });

        const manager = getGameRoomManager();
        const room = manager.join(roomId, guestId);
        if (!room) return Response.json({ error: 'Room not found or full' }, { status: 404 });

        const questions = generateQuestions();
        manager.setQuestions(roomId, questions);
        const updatedRoom = manager.update(roomId, { status: 'playing' });

        await supabaseServer.channel(`game-${roomId}`).send({
            type: 'broadcast',
            event: 'player-joined',
            payload: { guestId, room: updatedRoom }
        });

        return Response.json({ success: true, room: updatedRoom });
    } catch (error) {
        console.error('Error joining game room:', error);
        return Response.json({ error: 'Failed' }, { status: 500 });
    }
}
