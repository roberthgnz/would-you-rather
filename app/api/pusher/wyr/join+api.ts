import { getWYRRoomManager, type WYRQuestion } from '@/lib/rooms/wyr-room';
import { pusherServer } from '@/lib/pusher';
import { getRandomWYRQuestions } from '@/lib/data/wyr-questions';

function generateQuestions(): WYRQuestion[] {
    const questions = getRandomWYRQuestions(8);
    return questions.map((q, i) => ({ id: Date.now() + i, ...q }));
}

export async function POST(request: Request) {
    try {
        const { roomId, guestId } = await request.json();
        if (!roomId || !guestId) return Response.json({ error: 'Missing fields' }, { status: 400 });

        const manager = getWYRRoomManager();
        const room = manager.join(roomId, guestId);
        if (!room) return Response.json({ error: 'Room not found or full' }, { status: 404 });

        const questions = generateQuestions();
        manager.setQuestions(roomId, questions);
        const updatedRoom = manager.update(roomId, { status: 'playing' });

        await pusherServer.trigger(`game-${roomId}`, 'player-joined', { guestId, room: updatedRoom });

        return Response.json({ success: true, room: updatedRoom });
    } catch (error) {
        console.error('Error joining WYR room:', error);
        return Response.json({ error: 'Failed' }, { status: 500 });
    }
}
