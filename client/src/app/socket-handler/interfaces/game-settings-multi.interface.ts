import { BotDifficulty } from '@app/services/bot-difficulty';
import { GameMode } from '@app/socket-handler/interfaces/game-mode.interface';

export interface OnlineGameSettingsUI {
    gameMode: GameMode;
    timePerTurn: number;
    playerNames: string[];
    randomBonus: boolean;
    botDifficulty: BotDifficulty;
    numberOfPlayers: number;
}

export interface OnlineGameSettings extends OnlineGameSettingsUI {
    id: string;
}
