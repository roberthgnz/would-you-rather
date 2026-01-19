import { Check, Clock } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { WYRAnswer } from '../../types';

interface PartnerStatusProps {
    showingResult: boolean;
    opponentVoted: boolean;
    opponentDisplayAnswer: WYRAnswer;
}

export function PartnerStatus({ showingResult, opponentVoted, opponentDisplayAnswer }: PartnerStatusProps) {
    return (
        <View style={styles.partnerStatusCard}>
            <View style={styles.partnerStatusRow}>
                <Text style={styles.partnerLabel}>Tu pareja</Text>
                {showingResult ? (
                    <View style={[styles.statusBadge, opponentDisplayAnswer === 'A' ? styles.bgPink100 : styles.bgPurple100]}>
                        <Text style={[styles.statusBadgeText, opponentDisplayAnswer === 'A' ? styles.textPink700 : styles.textPurple700]}>
                            Opción {opponentDisplayAnswer}
                        </Text>
                    </View>
                ) : opponentVoted ? (
                    <View style={styles.statusRow}>
                        <Check size={14} color="#059669" />
                        <Text style={styles.textGreen600}>Ha votado</Text>
                    </View>
                ) : (
                    <View style={styles.statusRow}>
                        <Clock size={14} color="#D97706" />
                        <Text style={styles.textAmber600}>Esperando...</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    partnerStatusCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    partnerStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    partnerLabel: {
        fontWeight: 'bold',
        color: '#374151',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9999,
    },
    statusBadgeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    bgPink100: { backgroundColor: '#FCE7F3' },
    bgPurple100: { backgroundColor: '#F3E8FF' },
    textPink700: { color: '#BE185D' },
    textPurple700: { color: '#7E22CE' },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    textGreen600: { color: '#059669', fontSize: 14 },
    textAmber600: { color: '#D97706', fontSize: 14 },
});
