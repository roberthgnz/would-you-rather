import { getRandomQuestions } from '@/lib/data/game-questions';
import { getGameRoomManager, type Question } from '@/lib/rooms/game-room';
import { supabaseServer } from '@/lib/supabase-server';

function generateQuestions(): Question[] {
    const questions = getRandomQuestions(8);
    return questions.map((q: any, i: number) => ({ id: Date.now() + i, ...q }));
}

export async function POST(request: Request) {
    try {
        const { roomId, playerId } = await request.json();
        if (!roomId || !playerId) return Response.json({ error: 'Missing' }, { status: 400 });

        const manager = getGameRoomManager();
        const room = manager.getRoom(roomId);
        if (!room) return Response.json({ error: 'Not found' }, { status: 404 });

        const questions = generateQuestions();
        const updatedRoom = manager.update(roomId, {
            questions,
            currentQuestionIndex: 0,
            hostAnswer: null,
            guestAnswer: null,
            results: [],
            showingResult: false,
            status: 'playing',
        });

        await supabaseServer.channel(`game-${roomId}`).send({
            type: 'broadcast',
            event: 'game-reset',
            payload: { questions }
        });

        return Response.json({ success: true, room: updatedRoom });
    } catch (error) {
        console.error('Error reset:', error);
        return Response.json({ error: 'Failed' }, { status: 500 });
    }
}
