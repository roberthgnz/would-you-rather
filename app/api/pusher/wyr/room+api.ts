import { getWYRRoomManager } from '@/lib/rooms/wyr-room';

export async function POST(request: Request) {
    try {
        const { hostId } = await request.json();
        if (!hostId) return Response.json({ error: 'hostId required' }, { status: 400 });

        const room = getWYRRoomManager().create(hostId);
        return Response.json({ success: true, roomId: room.id, room });
    } catch (error) {
        console.error('Error creating WYR room:', error);
        return Response.json({ error: 'Failed' }, { status: 500 });
    }
}
