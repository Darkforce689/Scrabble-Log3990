import { Vec2 } from '@app/classes/vec2';
import { Direction } from '@app/game/game-logic/actions/direction.enum';
import { Tile } from '@app/game/game-logic/board/tile';
import { JOKER_CHAR, NOT_FOUND } from '@app/game/game-logic/constants';
import { ServerGame } from '@app/game/game-logic/game/server-game';
import { PositionSettings } from '@app/game/game-logic/interface/position-settings';
import { ValidWord, VERTICAL } from '@app/game/game-logic/interface/valid-word';
import { BotCalculatorService } from '@app/game/game-logic/player/bot-calculator/bot-calculator.service';
import { BotPlayer } from '@app/game/game-logic/player/bot-player';
import { Player } from '@app/game/game-logic/player/player';
import { getRandomInt } from '@app/game/game-logic/utils';
import { BotDictionaryService } from '@app/game/game-logic/validator/dictionary/bot-dictionary/bot-dictionary';
import { WordSearcher } from '@app/game/game-logic/validator/word-search/word-searcher.service';

const EMPTY = 0;
const END_OF_BOARD = 14;
const START_OF_BOARD = 0;
const MIDDLE_OF_BOARD = 7;

export class BotCrawler {
    constructor(
        private botDictionaryService: BotDictionaryService,
        protected botCalculatorService: BotCalculatorService,
        protected wordValidator: WordSearcher,
    ) {}

    botFirstTurn(player: BotPlayer, game: ServerGame) {
        for (let rackIndex = 0; rackIndex < player.letterRack.length; rackIndex++) {
            if (player.timesUp) {
                break;
            }
            const startingLetter = player.letterRack[rackIndex].char.toLowerCase();
            if (startingLetter !== JOKER_CHAR) {
                const placedLetter: ValidWord[] = [];
                const initialWord = new ValidWord(startingLetter);
                const tmpLetter = player.letterRack.splice(rackIndex, 1);

                if (getRandomInt(1)) {
                    initialWord.isVertical = VERTICAL;
                }

                initialWord.startingTileX = MIDDLE_OF_BOARD;
                initialWord.startingTileY = MIDDLE_OF_BOARD;
                initialWord.leftCount = MIDDLE_OF_BOARD;
                initialWord.rightCount = MIDDLE_OF_BOARD;
                placedLetter.push(initialWord);
                const possiblyValidWords: ValidWord[] = this.possibleWordsGenerator(placedLetter, player, game.gameToken);
                possiblyValidWords.forEach((word) => {
                    word.numberOfLettersPlaced++;
                });
                player.letterRack.splice(rackIndex, 0, tmpLetter[0]);

                this.possibleWordsValidator(possiblyValidWords, game, player);
            }
        }
    }

    boardCrawler(startingPosition: Vec2, game: ServerGame, player: BotPlayer, isVerticalFlag: boolean) {
        const grid: Tile[][] = game.board.grid;
        if (player.timesUp) {
            return;
        }
        let x = startingPosition.x;
        let y = startingPosition.y;
        let isVertical = isVerticalFlag;
        let letterInBox = grid[y][x].letterObject.char;
        while (letterInBox === ' ') {
            const coord = isVertical ? y : x;
            if (coord !== END_OF_BOARD) {
                [x, y] = isVertical ? [x, y + 1] : [x + 1, y];
            } else break;
            letterInBox = grid[y][x].letterObject.char;
        }
        if (letterInBox !== ' ') {
            const position: PositionSettings = { x, y, isVertical };
            const lettersOnLine = this.getLettersOnLine(position, grid, letterInBox);
            const allPlacedLettersCombination = this.getAllPossibilitiesOnLine(lettersOnLine);
            const possiblyValidWords: ValidWord[] = this.possibleWordsGenerator(allPlacedLettersCombination, player, game.gameToken);
            this.possibleWordsValidator(possiblyValidWords, game, player);
        }

        if (isVertical && x < END_OF_BOARD) {
            x++;
            y = START_OF_BOARD;
            const position: Vec2 = { x, y };
            this.boardCrawler(position, game, player, isVertical);
            return;
        } else if (isVertical && x === END_OF_BOARD) {
            return;
        } else if (!isVertical && y < END_OF_BOARD) {
            x = START_OF_BOARD;
            y++;
            const position: Vec2 = { x, y };
            this.boardCrawler(position, game, player, isVertical);
            return;
        } else {
            x = START_OF_BOARD;
            y = START_OF_BOARD;
            const position: Vec2 = { x, y };
            isVertical = true;
            this.boardCrawler(position, game, player, isVertical);
            return;
        }
    }

    private getAllPossibilitiesOnLine(lettersOnLine: ValidWord): ValidWord[] {
        const allPossibilities: ValidWord[] = [];
        const startOfLine = 0;
        let leftIndex = startOfLine;
        let rightIndex = startOfLine;
        const endOfLine = lettersOnLine.word.length;
        let subWord: string;

        let emptyBox = lettersOnLine.word.indexOf('-');
        let index = emptyBox;

        if (emptyBox === NOT_FOUND) {
            lettersOnLine.word = lettersOnLine.word.toLowerCase();
            allPossibilities.push(lettersOnLine);
        } else {
            let maxGroupSize = 1;

            while (emptyBox !== NOT_FOUND) {
                maxGroupSize++;

                while (lettersOnLine.word.charAt(index) === '-') {
                    index++;
                }
                leftIndex = index;
                emptyBox = lettersOnLine.word.indexOf('-', leftIndex);
                index = emptyBox;
            }

            let tmpSubWord: ValidWord = new ValidWord('');
            let leftCounter = 0;
            let rightCounter = 0;

            for (let groupsOf = 1; groupsOf <= maxGroupSize; groupsOf++) {
                tmpSubWord = new ValidWord('');
                leftIndex = startOfLine;
                emptyBox = lettersOnLine.word.indexOf('-');
                index = emptyBox;

                for (let passCount = 1; passCount < groupsOf; passCount++) {
                    while (lettersOnLine.word.charAt(index) === '-') {
                        index++;
                    }
                    rightIndex = index;
                    emptyBox = lettersOnLine.word.indexOf('-', rightIndex);
                    index = emptyBox;
                }
                rightIndex = index;

                while (emptyBox !== NOT_FOUND) {
                    tmpSubWord = new ValidWord('');
                    subWord = lettersOnLine.word.substring(leftIndex, rightIndex);
                    tmpSubWord.word = subWord.toLowerCase();
                    if (leftIndex === startOfLine) {
                        tmpSubWord.leftCount = lettersOnLine.leftCount;
                    } else {
                        tmpSubWord.leftCount = leftCounter;
                    }
                    tmpSubWord.isVertical = lettersOnLine.isVertical;
                    if (lettersOnLine.isVertical) {
                        tmpSubWord.startingTileY = lettersOnLine.startingTileY + leftIndex;
                        tmpSubWord.startingTileX = lettersOnLine.startingTileX;
                    } else {
                        tmpSubWord.startingTileY = lettersOnLine.startingTileY;
                        tmpSubWord.startingTileX = lettersOnLine.startingTileX + leftIndex;
                    }
                    rightCounter = 0;
                    rightIndex++;

                    while (lettersOnLine.word.charAt(rightIndex) === '-') {
                        rightCounter++;
                        rightIndex++;
                    }
                    tmpSubWord.rightCount = rightCounter;
                    allPossibilities.push(tmpSubWord);

                    while (lettersOnLine.word.charAt(leftIndex) !== '-') {
                        leftIndex++;
                    }
                    leftCounter = 0;
                    leftIndex++;

                    while (lettersOnLine.word.charAt(leftIndex) === '-') {
                        leftCounter++;
                        leftIndex++;
                    }
                    emptyBox = lettersOnLine.word.indexOf('-', rightIndex);
                    rightIndex = emptyBox;
                }
                tmpSubWord = new ValidWord('');
                subWord = lettersOnLine.word.substring(leftIndex, endOfLine);
                tmpSubWord.word = subWord.toLowerCase();
                if (leftIndex === startOfLine) {
                    tmpSubWord.leftCount = lettersOnLine.leftCount;
                } else {
                    tmpSubWord.leftCount = leftCounter;
                }
                tmpSubWord.rightCount = lettersOnLine.rightCount;
                tmpSubWord.isVertical = lettersOnLine.isVertical;
                if (lettersOnLine.isVertical) {
                    tmpSubWord.startingTileY = lettersOnLine.startingTileY + leftIndex;
                    tmpSubWord.startingTileX = lettersOnLine.startingTileX;
                } else {
                    tmpSubWord.startingTileY = lettersOnLine.startingTileY;
                    tmpSubWord.startingTileX = lettersOnLine.startingTileX + leftIndex;
                }
                allPossibilities.push(tmpSubWord);
            }
        }
        return allPossibilities;
    }

    private getLettersOnLine(position: PositionSettings, grid: Tile[][], letterInBox: string): ValidWord {
        const lettersOnLine: ValidWord = new ValidWord('');
        let lastLetterOfLine: number;
        let rightCount = 0;

        lettersOnLine.leftCount = position.isVertical ? position.y : position.x;
        lettersOnLine.isVertical = position.isVertical;
        lettersOnLine.startingTileX = position.x;
        lettersOnLine.startingTileY = position.y;
        if (position.isVertical) {
            let tmpY = END_OF_BOARD;
            let tmpYLetterInBox = grid[tmpY][position.x].letterObject.char;

            while (tmpYLetterInBox === ' ') {
                tmpY--;
                rightCount++;
                tmpYLetterInBox = grid[tmpY][position.x].letterObject.char;
            }
            lastLetterOfLine = tmpY;
            lettersOnLine.rightCount = rightCount;
            tmpY = position.y;

            while (tmpY <= lastLetterOfLine) {
                letterInBox = grid[tmpY][position.x].letterObject.char;
                lettersOnLine.word = lettersOnLine.word.concat(this.emptyCheck(letterInBox));
                tmpY++;
            }
        } else {
            let tmpX = END_OF_BOARD;
            let tmpXLetterInBox = grid[position.y][tmpX].letterObject.char;

            while (tmpXLetterInBox === ' ') {
                tmpX--;
                rightCount++;
                tmpXLetterInBox = grid[position.y][tmpX].letterObject.char;
            }
            lastLetterOfLine = tmpX;
            lettersOnLine.rightCount = rightCount;
            tmpX = position.x;

            while (tmpX <= lastLetterOfLine) {
                letterInBox = grid[position.y][tmpX].letterObject.char;
                lettersOnLine.word = lettersOnLine.word.concat(this.emptyCheck(letterInBox));
                tmpX++;
            }
        }
        return lettersOnLine;
    }

    private emptyCheck(letterInBox: string): string {
        return letterInBox !== ' ' ? letterInBox : '-';
    }

    private possibleWordsGenerator(allPlacedLettersCombination: ValidWord[], player: Player, gameToken: string): ValidWord[] {
        const possiblyValidWords: ValidWord[] = [];
        let tmpWordList: ValidWord[] = [];

        for (const placedLetters of allPlacedLettersCombination) {
            tmpWordList = this.botDictionaryService.wordGen(placedLetters, gameToken);

            for (const word of tmpWordList) {
                const wordToValidate = this.botDictionaryService.regexValidation(word, placedLetters.word, player.letterRack);
                if (wordToValidate !== 'false') {
                    possiblyValidWords.push(
                        new ValidWord(
                            wordToValidate,
                            word.indexFound,
                            word.emptyCount,
                            word.leftCount,
                            word.rightCount,
                            word.isVertical,
                            word.startingTileX,
                            word.startingTileY,
                            word.numberOfLettersPlaced,
                        ),
                    );
                }
            }
        }
        return possiblyValidWords;
    }

    private possibleWordsValidator(possiblyValidWords: ValidWord[], game: ServerGame, player: BotPlayer) {
        const grid: Tile[][] = game.board.grid;
        for (const wordData of possiblyValidWords) {
            const direction = wordData.isVertical ? Direction.Vertical : Direction.Horizontal;
            const placement = { x: wordData.startingTileX, y: wordData.startingTileY, direction };
            const validWords = this.wordValidator.getListOfValidWords({ word: wordData.word, placement }, grid, game.gameToken);
            const wordIsValid = validWords.length > EMPTY;
            if (!wordIsValid) {
                continue;
            }
            const words = validWords.map((validWord) => validWord.letters);
            const pointEstimation = this.botCalculatorService.testPlaceLetterCalculation(wordData.numberOfLettersPlaced, words);
            wordData.value = pointEstimation;
            wordData.adjacentWords = validWords;
            player.validWordList.push(wordData);
        }
    }
}
