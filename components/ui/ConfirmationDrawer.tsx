import { LogOut, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface ConfirmationDrawerProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
}

export function ConfirmationDrawer({
    visible,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    cancelText,
}: ConfirmationDrawerProps) {
    const [shouldRender, setShouldRender] = useState(visible);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
        } else {
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!shouldRender && !visible) return null;

    return (
        <Modal
            visible={shouldRender}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {visible && (
                    <Animated.View
                        entering={FadeIn.duration(300)}
                        exiting={FadeOut.duration(300)}
                        style={StyleSheet.absoluteFill}
                    >
                        <Pressable style={styles.overlayPressable} onPress={onClose} />
                    </Animated.View>
                )}
                
                {visible && (
                    <Animated.View 
                        entering={SlideInDown.duration(300)}
                        exiting={SlideOutDown.duration(300)}
                        style={styles.drawer} 
                    >
                        <Pressable onPress={(e) => e.stopPropagation()}>
                            <View style={styles.header}>
                                <View style={styles.iconContainer}>
                                    <LogOut size={24} color="#EF4444" />
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <X size={24} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.content}>
                                <Text style={styles.title}>{title}</Text>
                                <Text style={styles.description}>{description}</Text>
                            </View>

                            <View style={styles.footer}>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={[styles.button, styles.primaryButton]}
                                >
                                    <Text style={styles.primaryButtonText}>{cancelText}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    style={[styles.button, styles.secondaryButton]}
                                >
                                    <Text style={styles.secondaryButtonText}>{confirmText}</Text>
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Animated.View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlayPressable: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    drawer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#4B5563',
        lineHeight: 24,
    },
    footer: {
        flexDirection: 'column',
        gap: 12,
    },
    button: {
        width: '100%',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#EC4899',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
    },
    secondaryButtonText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '500',
    },
});
