/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-bitwise*/
import { MatDialog } from '@angular/material/dialog';
import { EXP_PER_LEVEL, MAX_LEVEL, MAX_LEVEL_EXP } from '@app/account/constants';
import { AlertDialogComponent } from '@app/components/modals/alert-dialog/alert-dialog.component';
import { BOARD_MAX_POSITION, BOARD_MIN_POSITION, BOT_AVATARS } from '@app/game-logic/constants';
import { Direction } from '@app/game-logic/direction.enum';
import { Tile } from '@app/game-logic/game/board/tile';
import { PlacementSetting } from '@app/game-logic/interfaces/placement-setting.interface';
import { GameMode } from '@app/socket-handler/interfaces/game-mode.interface';
import { OnlineGameSettingsUI } from '@app/socket-handler/interfaces/game-settings-multi.interface';
import { Socket } from 'socket.io-client';

export const placementSettingsToString = (placement: PlacementSetting): string => {
    const x = placement.x;
    const y = placement.y;
    const direction = placement.direction;
    if (x < BOARD_MIN_POSITION || x > BOARD_MAX_POSITION) {
        throw Error('X value not between 0-14');
    }

    if (y < BOARD_MIN_POSITION || y > BOARD_MAX_POSITION) {
        throw Error('Y value not between 0-14');
    }

    if (!Object.values(Direction).includes(direction)) {
        throw Error('Invalid direction');
    }

    const rowCode = 'a'.charCodeAt(0) + y;
    const row = String.fromCharCode(rowCode);

    const colNumber = x + 1;
    const col = colNumber.toString();

    const directionString = direction.toLowerCase();
    return `${row}${col}${directionString}`;
};

export const isCharUpperCase = (char: string) => {
    if (char.length !== 1) {
        throw Error('the string given is not a char');
    }
    const charCode = char.charCodeAt(0);
    return charCode >= 'A'.charCodeAt(0) && charCode <= 'Z'.charCodeAt(0);
};

export const isGameSettings = (obj: unknown): obj is OnlineGameSettingsUI => {
    return (
        (obj as OnlineGameSettingsUI).playerNames !== undefined &&
        typeof (obj as OnlineGameSettingsUI).playerNames === 'object' &&
        (obj as OnlineGameSettingsUI).numberOfPlayers !== undefined &&
        typeof (obj as OnlineGameSettingsUI).numberOfPlayers === 'number' &&
        (obj as OnlineGameSettingsUI).randomBonus !== undefined &&
        typeof (obj as OnlineGameSettingsUI).randomBonus === 'boolean' &&
        (obj as OnlineGameSettingsUI).gameMode !== undefined &&
        typeof (obj as OnlineGameSettingsUI).gameMode === 'string' &&
        (obj as OnlineGameSettingsUI).timePerTurn !== undefined &&
        typeof (obj as OnlineGameSettingsUI).timePerTurn === 'number' &&
        ((obj as OnlineGameSettingsUI).gameMode !== GameMode.Magic ||
            ((obj as OnlineGameSettingsUI).magicCardIds !== undefined && typeof (obj as OnlineGameSettingsUI).magicCardIds === 'object'))
    );
};

export const isSocketConnected = (socket: Socket | undefined): boolean => {
    return socket ? socket.connected : false;
};

export const isStringALowerCaseLetter = (string: string): boolean => {
    if (string.length !== 1) {
        return false;
    }
    const charCode = string.charCodeAt(0);
    return charCode >= 'a'.charCodeAt(0) && charCode <= 'z'.charCodeAt(0);
};

export const isStringAnUpperCaseLetter = (string: string): boolean => {
    if (string.length !== 1) {
        return false;
    }
    const charCode = string.charCodeAt(0);
    return charCode >= 'A'.charCodeAt(0) && charCode <= 'Z'.charCodeAt(0);
};

export const convertToProperLetter = (string: string): string => {
    return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const getRandomInt = (max: number, min: number = 0): number => {
    return Math.floor(Math.random() * (max - min) + min);
};

export const copyGrid = (grid: Tile[][]): Tile[][] => {
    const copiedGrid = [];
    for (const row of grid) {
        const copiedRow = [];
        for (const tile of row) {
            const copiedTile = new Tile();
            copiedTile.letterMultiplicator = tile.letterMultiplicator;
            copiedTile.letterObject = { ...tile.letterObject };
            copiedTile.wordMultiplicator = tile.wordMultiplicator;
            copiedRow.push(copiedTile);
        }
        copiedGrid.push(copiedRow);
    }
    return copiedGrid;
};

export const stringifyWord = (word: Tile[]): string => {
    const letters: string[] = word.map((tile: Tile) => tile.letterObject.char);
    const stringifiedWord = letters.join('');
    return stringifiedWord;
};

export const wordifyString = (word: string): Tile[] => {
    const stringList = word.split('');
    const tileList: Tile[] = stringList.map((char: string) => {
        const newTile = new Tile();
        newTile.letterObject.char = char;
        return newTile;
    });
    return tileList;
};

export const openErrorDialog = (dialog: MatDialog, width: string, errorContent: string) => {
    dialog.open(AlertDialogComponent, {
        width,
        data: {
            message: errorContent,
            button1: 'Ok',
            button2: '',
        },
    });
};

export const currentLevel = (totalExp: number): number => {
    const level = Math.floor(Math.sqrt(totalExp / EXP_PER_LEVEL));
    return level <= MAX_LEVEL ? level : MAX_LEVEL;
};

export const getNextLevel = (totalExp: number): number => {
    return currentLevel(totalExp) < MAX_LEVEL ? currentLevel(totalExp) + 1 : MAX_LEVEL;
};

export const getProgressValue = (totalExp: number): number => {
    const level = Math.sqrt(totalExp / EXP_PER_LEVEL);
    const decimal = level - Math.floor(level);
    const percent = 100;
    return totalExp < MAX_LEVEL_EXP ? decimal * percent : 100;
};

export const isInsideOfBoard = (x: number, y: number) => {
    return x >= BOARD_MIN_POSITION && x <= BOARD_MAX_POSITION && y >= BOARD_MIN_POSITION && y <= BOARD_MAX_POSITION;
};

export const getBotAvatar = (name: string) => {
    return BOT_AVATARS[hashCode(name) % BOT_AVATARS.length];
};

const hashCode = (s: string) => {
    let hash = 0;
    if (s.length === 0) return hash;
    for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i);
        hash = hash * 32 - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};
