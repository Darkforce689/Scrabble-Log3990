import { BotDifficulty } from '@app/game/game-logic/player/bot/bot-difficulty';
interface BotInfo {
    name: string;
    type: BotDifficulty;
}

export const DEFAULT_BOT: BotInfo[] = [
    { name: 'Jimmy', type: BotDifficulty.Easy },
    { name: 'Sasha', type: BotDifficulty.Easy },
    { name: 'BeepBoop', type: BotDifficulty.Easy },
    { name: 'Martin', type: BotDifficulty.Easy },
    { name: 'Wayne', type: BotDifficulty.Easy },
    { name: 'Fabian', type: BotDifficulty.Easy },
    { name: 'Juan', type: BotDifficulty.Easy },
    { name: 'Oliver', type: BotDifficulty.Easy },
    { name: 'Maria', type: BotDifficulty.Easy },
    { name: 'Wilson', type: BotDifficulty.Easy },
    { name: 'Laura', type: BotDifficulty.Easy },
    { name: 'Noah', type: BotDifficulty.Easy },
    { name: 'James', type: BotDifficulty.Easy },
    { name: 'Benjamin', type: BotDifficulty.Easy },
    { name: 'Lucas', type: BotDifficulty.Easy },
    { name: 'Henry', type: BotDifficulty.Easy },
    { name: 'Alexander', type: BotDifficulty.Easy },
    { name: 'Mason', type: BotDifficulty.Easy },
    { name: 'Michael', type: BotDifficulty.Easy },
    { name: 'Ethan', type: BotDifficulty.Easy },
    { name: 'Daniel', type: BotDifficulty.Easy },
    { name: 'Jacob', type: BotDifficulty.Easy },

    { name: 'Terminator', type: BotDifficulty.Expert },
    { name: 'Skynet', type: BotDifficulty.Expert },
    { name: 'Stockfish', type: BotDifficulty.Expert },
    { name: 'AlphaZero', type: BotDifficulty.Expert },
    { name: 'DeepBlue', type: BotDifficulty.Expert },
    { name: 'Mario', type: BotDifficulty.Expert },
    { name: 'Spooky', type: BotDifficulty.Expert },
    { name: 'Sonic', type: BotDifficulty.Expert },
    { name: 'Lynne', type: BotDifficulty.Expert },
    { name: 'Optix', type: BotDifficulty.Expert },
    { name: 'Machina', type: BotDifficulty.Expert },
];
