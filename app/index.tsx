import React from 'react';
import { GameLayout } from '../components/GameLayout';
import MultiplayerGame from '../components/MultiplayerGame';
import MultiplayerLobby from '../components/MultiplayerLobby';
import WaitingRoom from '../components/WaitingRoom';
import { useGame } from '../hooks/useGame';

export default function GameScreen() {
    const {
        gameMode,
        state,
        handleRoomCreated,
        handleRoomJoined,
        handleGameStart,
        handleLeave,
        handleBack,
    } = useGame();

    return (
        <GameLayout>
            {gameMode === "lobby" && (
                <MultiplayerLobby 
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
        </GameLayout>
    );
}
