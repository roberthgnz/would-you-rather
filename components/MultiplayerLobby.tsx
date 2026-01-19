import * as Haptics from 'expo-haptics';
import { LogIn, Plus } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../constants/api';
import type { WYRQuestion } from '../types';

interface Props {
    onRoomCreated: (roomId: string, playerId: string) => void;
    onRoomJoined: (roomId: string, playerId: string, questions: WYRQuestion[]) => void;
    onBack: () => void;
}

const generatePlayerId = () => `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export default function WYRMultiplayerLobby({ onRoomCreated, onRoomJoined, onBack }: Props) {
    const [lobbyState, setLobbyState] = useState<"menu" | "joining">("menu");
    const [joinRoomId, setJoinRoomId] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const isCancelled = useRef(false);

    useEffect(() => {
        return () => { isCancelled.current = true; };
    }, []);

    const handleCreateRoom = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsLoading(true);
        setError(null);
        isCancelled.current = false;
        const playerId = generatePlayerId();

        try {
            const res = await fetch(`${API_URL}/api/wyr/room`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hostId: playerId }),
            });
            const data = await res.json();
            
            if (isCancelled.current) {
                if (data.roomId) {
                    fetch(`${API_URL}/api/wyr/leave`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ roomId: data.roomId, playerId }),
                    }).catch(() => {});
                }
                return;
            }

            if (data.roomId) onRoomCreated(data.roomId, playerId);
            else setError("Error al crear la sala");
        } catch { 
            if (!isCancelled.current) setError("Error de conexión"); 
        }
        finally { if (!isCancelled.current) setIsLoading(false); }
    };

    const handleJoinRoom = async () => {
        if (!joinRoomId.trim()) { setError("Ingresa un código"); return; }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsLoading(true);
        setError(null);
        isCancelled.current = false;
        const playerId = generatePlayerId();

        try {
            const res = await fetch(`${API_URL}/api/wyr/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId: joinRoomId.toUpperCase().trim(), guestId: playerId }),
            });
            const data = await res.json();

            if (isCancelled.current) {
                if (data.success && data.room) {
                    fetch(`${API_URL}/api/wyr/leave`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ roomId: data.room.id, playerId }),
                    }).catch(() => {});
                }
                return;
            }

            if (data.success && data.room) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onRoomJoined(data.room.id, playerId, data.room.questions || []);
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setError(data.error || "Error al unirse");
            }
        } catch {
            if (!isCancelled.current) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setError("Error de conexión");
            }
        }
        finally { if (!isCancelled.current) setIsLoading(false); }
    };

    const handleCancel = () => {
        isCancelled.current = true;
        setIsLoading(false);
        if (lobbyState === "menu") {
            onBack();
        } else {
            setLobbyState("menu");
            setError(null);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>🤔</Text>
                    </View>
                    <Text style={styles.title}>¿Qué Prefiero?</Text>
                    <Text style={styles.subtitle}>Elige y descubre si coinciden</Text>
                </View>

                {lobbyState === "menu" && (
                    <View style={styles.menuContainer}>
                        <TouchableOpacity 
                            onPress={handleCreateRoom} 
                            disabled={isLoading}
                            style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Plus size={24} color="white" />
                                    <Text style={styles.primaryButtonText}>Crear Sala</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => { 
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
                                setLobbyState("joining"); 
                            }}
                            disabled={isLoading}
                            style={[styles.button, styles.secondaryButton, isLoading && styles.disabledButton]}
                        >
                            <LogIn size={24} color="#374151" />
                            <Text style={styles.secondaryButtonText}>Unirse a Sala</Text>
                        </TouchableOpacity>
                        
                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>
                )}

                {lobbyState === "joining" && (
                    <View style={styles.joinCard}>
                        <View style={styles.joinHeader}>
                            <Text style={styles.joinTitle}>Unirse a Sala</Text>
                            <Text style={styles.joinSubtitle}>Código de 6 caracteres</Text>
                        </View>
                        
                        <TextInput
                            value={joinRoomId}
                            onChangeText={(text) => { 
                                setJoinRoomId(text.toUpperCase().slice(0, 6)); 
                                setError(null); 
                            }}
                            placeholder="XXXXXX"
                            maxLength={6}
                            autoCapitalize="characters"
                            style={styles.input}
                            autoFocus
                        />
                        
                        {error && <Text style={styles.errorText}>{error}</Text>}
                        
                        <TouchableOpacity 
                            onPress={handleJoinRoom} 
                            disabled={isLoading || joinRoomId.length !== 6}
                            style={[styles.button, styles.primaryButton, styles.marginTop, (isLoading || joinRoomId.length !== 6) && styles.disabledButton]}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <LogIn size={20} color="white" />
                                    <Text style={styles.primaryButtonText}>Unirse</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        zIndex: 20,
    },
    backButtonText: {
        color: '#4B5563',
        fontSize: 16,
    },
    content: {
        width: '100%',
        maxWidth: 380,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 64,
        height: 64,
        backgroundColor: '#EC4899',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    iconText: {
        fontSize: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 16,
        color: '#4B5563',
        marginTop: 4,
    },
    menuContainer: {
        gap: 16,
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    primaryButton: {
        backgroundColor: '#EC4899',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    secondaryButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    joinCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    joinHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    joinTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    joinSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    input: {
        width: '100%',
        textAlign: 'center',
        fontSize: 24,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 4,
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        color: '#1F2937',
    },
    marginTop: {
        marginTop: 16,
    },
});
