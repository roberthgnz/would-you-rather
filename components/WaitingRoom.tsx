import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Copy, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Pusher from 'pusher-js';
import * as Haptics from 'expo-haptics';
import { PUSHER_CONFIG, API_URL } from '../constants/api';
import type { WYRQuestion } from '../types';

interface Props {
    roomId: string;
    playerId: string;
    onGameStart: (questions: WYRQuestion[]) => void;
    onCancel: () => void;
}

export default function WaitingRoom({ roomId, playerId, onGameStart, onCancel }: Props) {
    const [copied, setCopied] = useState(false);
    const pusherRef = useRef<Pusher | null>(null);

    useEffect(() => {
        const pusher = new Pusher(PUSHER_CONFIG.key, {
            cluster: PUSHER_CONFIG.cluster,
            authEndpoint: `${API_URL}/api/pusher/auth`,
            auth: { headers: { 'x-user-id': playerId, 'x-user-symbol': 'host' } },
        });
        pusherRef.current = pusher;
        const channel = pusher.subscribe(`game-${roomId}`);

        channel.bind('player-joined', (data: { room: { questions: WYRQuestion[] } }) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onGameStart(data.room.questions);
        });

        return () => { channel.unbind_all(); pusher.unsubscribe(`game-${roomId}`); pusher.disconnect(); };
    }, [roomId, playerId, onGameStart]);

    const copyCode = async () => {
        await Clipboard.setStringAsync(roomId);
        setCopied(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <ActivityIndicator size="large" color="#EC4899" style={styles.loader} />
                <Text style={styles.title}>Esperando a tu pareja</Text>
                <Text style={styles.subtitle}>Comparte el código:</Text>
                
                <TouchableOpacity onPress={copyCode} style={styles.codeButton}>
                    <View style={styles.codeContainer}>
                        <Text style={styles.codeText}>{roomId}</Text>
                        {copied ? <Check size={20} color="#10B981" /> : <Copy size={20} color="#F472B6" />}
                    </View>
                </TouchableOpacity>
                
                <Text style={styles.hintText}>{copied ? "¡Copiado!" : "Toca para copiar"}</Text>
                
                <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        width: '100%',
        maxWidth: 380,
        alignItems: 'center',
    },
    loader: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 16,
    },
    codeButton: {
        width: '100%',
        backgroundColor: '#FCE7F3',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    codeText: {
        fontSize: 30,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: '#DB2777',
        letterSpacing: 2,
    },
    hintText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    cancelButton: {
        width: '100%',
        backgroundColor: '#E5E7EB',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
