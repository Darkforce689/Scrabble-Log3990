import { Letter } from '@app/game-logic/game/board/letter.interface';
import { Tile } from '@app/game-logic/game/board/tile';

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

export interface PlayerInfoForfeit {
    name: string;
    previousPlayerName: string;
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
