import { getRandomWYRQuestions } from '@/lib/data/wyr-questions';
import { getWYRRoomManager, type WYRQuestion } from '@/lib/rooms/wyr-room';
import { supabaseServer } from '@/lib/supabase-server';

function generateQuestions(): WYRQuestion[] {
    const questions = getRandomWYRQuestions(8);
    return questions.map((q: any, i: number) => ({ id: Date.now() + i, ...q }));
}

export async function POST(request: Request) {
    try {
        const { roomId, playerId } = await request.json();
        if (!roomId || !playerId) return Response.json({ error: 'Missing' }, { status: 400 });

        const manager = getWYRRoomManager();
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
