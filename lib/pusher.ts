import Pusher from 'pusher';
import { PUSHER_CONFIG } from '@/constants/api';

export const pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: PUSHER_CONFIG.key,
    secret: process.env.PUSHER_SECRET!,
    cluster: PUSHER_CONFIG.cluster,
    useTLS: true,
});
