import { Letter } from '@app/game/game-logic/board/letter.interface';
import { Tile } from '@app/game/game-logic/board/tile';

export interface LightPlayer {
    name: string;
    points: number;
    letterRack: Letter[];
}

export interface GameState {
    players: LightPlayer[];
    activePlayerIndex: number;
    grid: Tile[][];
    lettersRemaining: number;
    isEndOfGame: boolean;
    winnerIndex: number[];
}

export interface ForfeitPlayerInfo {
    name: string;
    previousPlayerName: string;
}

export interface GameStateToken {
    gameState: GameState;
    gameToken: string;
}

export interface PlayerInfoToken {
    playerInfo: ForfeitPlayerInfo;
    gameToken: string;
}

export interface IMagicCard {
    id: string;
}

export interface MagicGameState extends GameState {
    drawnMagicCards: IMagicCard[][];
}

export interface SyncState {
    positions?: { x: number; y: number }[];
}

export interface SyncStateToken {
    syncState: SyncState;
    gameToken: string;
}
