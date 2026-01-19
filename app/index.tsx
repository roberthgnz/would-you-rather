import React from 'react';
import MultiplayerGame from '../components/MultiplayerGame';
import WYRMultiplayerLobby from '../components/MultiplayerLobby';
import { WYRLayout } from '../components/WYRLayout';
import WaitingRoom from '../components/WaitingRoom';
import { useWYRGame } from '../hooks/useWYRGame';

export default function WYRScreen() {
    const {
        gameMode,
        state,
        handleRoomCreated,
        handleRoomJoined,
        handleGameStart,
        handleLeave,
        handleBack,
    } = useWYRGame();

    return (
        <WYRLayout>
            {gameMode === "lobby" && (
                <WYRMultiplayerLobby 
                    onRoomCreated={handleRoomCreated} 
                    onRoomJoined={handleRoomJoined} 
                    onBack={handleBack} 
                />
            )}
            {gameMode === "waiting" && state && (
                <WaitingRoom 
                    roomId={state.roomId} 
                    playerId={state.playerId} 
                    onGameStart={handleGameStart} 
                    onCancel={handleLeave} 
                />
            )}
            {gameMode === "game" && state && (
                <MultiplayerGame 
                    roomId={state.roomId} 
                    playerId={state.playerId} 
                    isHost={state.isHost}
                    initialQuestions={state.questions} 
                    initialOpponentConnected={state.opponentConnected} 
                    onLeave={handleLeave} 
                />
            )}
        </WYRLayout>
    );
}
