import { ArrowLeft, Wifi, WifiOff } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ConnectionStatus } from '../../hooks/useWYRMultiplayer';

interface GameTopBarProps {
    onLeave: () => void;
    connectionStatus: ConnectionStatus;
    opponentConnected: boolean;
}

export function GameTopBar({ onLeave, connectionStatus, opponentConnected }: GameTopBarProps) {
    return (
        <View style={styles.topBar}>
            <TouchableOpacity onPress={onLeave} style={styles.backButton}>
                <ArrowLeft size={20} color="#4B5563" />
                <Text style={styles.backButtonText}>Salir</Text>
            </TouchableOpacity>
            <View style={styles.connectionStatus}>
                {connectionStatus === 'connected' ? <Wifi size={16} color="#10B981" /> : <WifiOff size={16} color="#EF4444" />}
                <Text style={[styles.statusText, { color: opponentConnected ? '#059669' : '#D97706' }]}>
                    {opponentConnected ? 'Conectados' : 'Esperando...'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backButtonText: {
        color: '#4B5563',
        fontSize: 16,
    },
    connectionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusText: {
        fontSize: 12,
    },
});
