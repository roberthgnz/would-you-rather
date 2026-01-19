import { getWYRRoomManager } from '@/lib/rooms/wyr-room';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
    try {
        const { roomId, playerId } = await request.json();
        if (!roomId || !playerId) return Response.json({ error: 'Missing' }, { status: 400 });

        const manager = getWYRRoomManager();
        const updatedRoom = manager.nextQuestion(roomId);
        if (!updatedRoom) return Response.json({ error: 'Failed' }, { status: 400 });

        const isFinished = updatedRoom.status === 'finished';

        if (isFinished) {
            await pusherServer.trigger(`game-${roomId}`, 'game-over', { results: updatedRoom.results });
        } else {
            await pusherServer.trigger(`game-${roomId}`, 'next-question', { currentQuestionIndex: updatedRoom.currentQuestionIndex });
        }

        return Response.json({ success: true, isFinished });
    } catch (error) {
        console.error('Error next:', error);
        return Response.json({ error: 'Failed' }, { status: 500 });
    }
}
