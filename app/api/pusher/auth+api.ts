import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        // @ts-ignore
        const socketId = formData.get('socket_id') as string;
        // @ts-ignore
        const channelName = formData.get('channel_name') as string;

        // Get user info from headers or query params
        // @ts-ignore
        const userId = request.headers.get('x-user-id') || formData.get('user_id') as string;
        // @ts-ignore
        const userSymbol = request.headers.get('x-user-symbol') || formData.get('user_symbol') as string;

        if (!socketId || !channelName) {
            return Response.json(
                { error: 'Missing socket_id or channel_name' },
                { status: 400 }
            );
        }

        if (!userId) {
            return Response.json(
                { error: 'Missing user_id' },
                { status: 400 }
            );
        }

        // Presence channel data
        const presenceData = {
            user_id: userId,
            user_info: {
                symbol: userSymbol || 'unknown',
            },
        };

        // Authenticate the user for the presence channel
        const authResponse = pusherServer.authorizeChannel(socketId, channelName, presenceData);

        return Response.json(authResponse);
    } catch (error) {
        console.error('Error authenticating Pusher channel:', error);
        return Response.json(
            { error: 'Failed to authenticate' },
            { status: 500 }
        );
    }
}
