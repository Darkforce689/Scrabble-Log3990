/* eslint-disable max-lines */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OnlineActionCompilerService } from '@app/game-logic/actions/online-actions/online-action-compiler.service';
import { PassTurn } from '@app/game-logic/actions/pass-turn';
import { PlaceLetter } from '@app/game-logic/actions/place-letter';
import { DEFAULT_TIME_PER_TURN } from '@app/game-logic/constants';
import { Direction } from '@app/game-logic/direction.enum';
import { BoardService } from '@app/game-logic/game/board/board.service';
import { Tile } from '@app/game-logic/game/board/tile';
import { GameState, LightPlayer } from '@app/game-logic/game/games/online-game/game-state';
import { TimerService } from '@app/game-logic/game/timer/timer.service';
import { Player } from '@app/game-logic/player/player';
import { User, UserStatus } from '@app/pages/register-page/user.interface';

import { AccountService } from '@app/services/account.service';
import { GameSocketHandlerService } from '@app/socket-handler/game-socket-handler/game-socket-handler.service';
import { Socket } from 'socket.io-client';
import { OnlineGame } from './online-game';

describe('OnlineGame', () => {
    let onlineGame: OnlineGame;
    let boardService: BoardService;
    let gameSocketHandlerService: GameSocketHandlerService;
    let timer: TimerService;
    let player1: Player;
    let player2: Player;
    const accountServiceMock = jasmine.createSpyObj('AccountService', ['actualizeAccount'], ['account']);

    beforeEach(() => {
        (Object.getOwnPropertyDescriptor(accountServiceMock, 'account')?.get as jasmine.Spy<() => User>).and.returnValue({
            name: 'p1',
            _id: '1',
            email: 'a@b.c',
            avatar: 'frite',
            averagePoints: 0,
            nGamePlayed: 0,
            nGameWon: 0,
            averageTimePerGame: 0,
            totalExp: 0,
            status: UserStatus.Online,
        });

        TestBed.configureTestingModule({
            providers: [{ provide: AccountService, useValue: accountServiceMock }],
            imports: [HttpClientTestingModule],
        });
        boardService = TestBed.inject(BoardService);
        gameSocketHandlerService = TestBed.inject(GameSocketHandlerService);
        timer = TestBed.inject(TimerService);

        onlineGame = new OnlineGame(
            '0',
            DEFAULT_TIME_PER_TURN,
            timer,
            gameSocketHandlerService,
            boardService,
            TestBed.inject(OnlineActionCompilerService),
            TestBed.inject(AccountService),
        );
        player1 = new Player('p1');
        player2 = new Player('p2');
        onlineGame.players = [player1, player2];
        onlineGame.userName = player1.name;
    });

    it('should create an instance', () => {
        expect(onlineGame).toBeTruthy();
    });

    it('should receive a gameState from gameSocketHandlerService', () => {
        const p1: LightPlayer = {
            name: 'p1',
            points: 0,
            letterRack: [
                { char: 'A', value: 1 },
                { char: 'B', value: 1 },
                { char: 'C', value: 1 },
            ],
        };

        const p2: LightPlayer = {
            name: 'p2',
            points: 0,
            letterRack: [
                { char: 'D', value: 1 },
                { char: 'E', value: 1 },
                { char: 'F', value: 1 },
            ],
        };

        const gameState: GameState = {
            players: [p1, p2],
            activePlayerIndex: 0,
            grid: boardService.board.grid,
            lettersRemaining: 96,
            isEndOfGame: false,
            winnerIndex: [],
        };
        spyOn(gameSocketHandlerService, 'playAction');
        gameSocketHandlerService['gameStateSubject'].next(gameState);
        onlineGame.receiveState(gameState);
        const result = onlineGame.players[0].letterRack;
        const expected = [
            { char: 'A', value: 1 },
            { char: 'B', value: 1 },
            { char: 'C', value: 1 },
        ];
        expect(result).toEqual(expected);
    });

    it('should receive a timerStartingTime start from gameSocketHandlerService', () => {
        const timerSpy = spyOn(timer, 'start').and.callThrough();

        gameSocketHandlerService['timerStartingTimeSubject'].next();
        expect(timerSpy).toHaveBeenCalled();
    });

    it('should forfeit', () => {
        gameSocketHandlerService.socket = {} as Socket;
        const forfeitSpy = spyOn(gameSocketHandlerService, 'disconnect').and.callFake(() => {
            return;
        });
        onlineGame['forfeit']();
        expect(forfeitSpy).toHaveBeenCalled();
    });

    it('should not forfeit', () => {
        gameSocketHandlerService.socket = undefined as unknown as Socket;
        const forfeitSpy = spyOn(gameSocketHandlerService, 'disconnect').and.callFake(() => {
            return;
        });
        onlineGame['forfeit']();
        expect(forfeitSpy).not.toHaveBeenCalled();
    });

    it('should close the game', () => {
        const p1: LightPlayer = {
            name: 'p3',
            points: 0,
            letterRack: [
                { char: 'A', value: 1 },
                { char: 'B', value: 1 },
                { char: 'C', value: 1 },
            ],
        };

        const p2: LightPlayer = {
            name: 'p4',
            points: 0,
            letterRack: [
                { char: 'D', value: 1 },
                { char: 'E', value: 1 },
                { char: 'F', value: 1 },
            ],
        };

        const gameState: GameState = {
            players: [p1, p2],
            activePlayerIndex: 0,
            grid: boardService.board.grid,
            lettersRemaining: 96,
            isEndOfGame: false,
            winnerIndex: [],
        };

        onlineGame.close();
        gameSocketHandlerService['gameStateSubject'].next(gameState);
        const result = onlineGame.players[0].name;
        const expected = 'p1';
        expect(result).toEqual(expected);
    });

    it('should handleUserAction and receive a PlaceLetter action', () => {
        const p1: LightPlayer = {
            name: 'p1',
            points: 0,
            letterRack: [
                { char: 'A', value: 1 },
                { char: 'B', value: 1 },
                { char: 'C', value: 1 },
            ],
        };

        const p2: LightPlayer = {
            name: 'p2',
            points: 0,
            letterRack: [
                { char: 'D', value: 1 },
                { char: 'E', value: 1 },
                { char: 'F', value: 1 },
            ],
        };

        const gameState: GameState = {
            players: [p1, p2],
            activePlayerIndex: 0,
            grid: boardService.board.grid,
            lettersRemaining: 96,
            isEndOfGame: false,
            winnerIndex: [],
        };
        const H = new Tile();
        H.letterObject = { char: 'H', value: 1 };
        boardService.board.grid[7][7] = H;
        gameSocketHandlerService['gameStateSubject'].next(gameState);
        const action = new PlaceLetter(onlineGame.players[0], 'hello', { x: 7, y: 7, direction: Direction.Horizontal });

        onlineGame.handleUserActions();
        const playActionSpy = spyOn(gameSocketHandlerService, 'playAction');
        onlineGame.players[0].action$.next(action);
        expect(playActionSpy).toHaveBeenCalled();
    });

    it('should handleUserAction and receive a Pass action', () => {
        const p1: LightPlayer = {
            name: 'p1',
            points: 0,
            letterRack: [
                { char: 'A', value: 1 },
                { char: 'B', value: 1 },
                { char: 'C', value: 1 },
            ],
        };

        const p2: LightPlayer = {
            name: 'p2',
            points: 0,
            letterRack: [
                { char: 'D', value: 1 },
                { char: 'E', value: 1 },
                { char: 'F', value: 1 },
            ],
        };

        const gameState: GameState = {
            players: [p1, p2],
            activePlayerIndex: 0,
            grid: boardService.board.grid,
            lettersRemaining: 96,
            isEndOfGame: false,
            winnerIndex: [],
        };

        gameSocketHandlerService['gameStateSubject'].next(gameState);
        const action = new PassTurn(onlineGame.players[0]);

        onlineGame.userName = p1.name;
        onlineGame.handleUserActions();
        const playActionSpy = spyOn(gameSocketHandlerService, 'playAction');
        onlineGame.players[0].action$.next(action);
        expect(playActionSpy).toHaveBeenCalled();
    });

    it('should handleUserAction when not his turn', () => {
        const p1: LightPlayer = {
            name: 'p1',
            points: 0,
            letterRack: [
                { char: 'A', value: 1 },
                { char: 'B', value: 1 },
                { char: 'C', value: 1 },
            ],
        };

        const p2: LightPlayer = {
            name: 'p2',
            points: 0,
            letterRack: [
                { char: 'D', value: 1 },
                { char: 'E', value: 1 },
                { char: 'F', value: 1 },
            ],
        };

        const gameState: GameState = {
            players: [p1, p2],
            activePlayerIndex: 1,
            grid: boardService.board.grid,
            lettersRemaining: 96,
            isEndOfGame: false,
            winnerIndex: [],
        };

        gameSocketHandlerService['gameStateSubject'].next(gameState);
        const action = new PlaceLetter(onlineGame.players[0], 'hello', { x: 7, y: 7, direction: Direction.Horizontal });

        onlineGame.handleUserActions();
        const playActionSpy = spyOn(gameSocketHandlerService, 'playAction');
        onlineGame.players[0].action$.next(action);
        expect(playActionSpy.calls.count()).toEqual(0);
    });

    it('should throw error because the action is not supported', () => {
        const action = undefined;

        expect(() => {
            onlineGame['receivePlayerAction'](action as unknown as PlaceLetter);
            onlineGame.players[0].action$.next(action);
        }).toThrowError('The action received is not supported by the compiler');
    });

    it('should place a vertical word', () => {
        onlineGame.players[0].letterRack = [
            { char: 'H', value: 1 },
            { char: '*', value: 1 },
            { char: 'L', value: 1 },
        ];
        const action = new PlaceLetter(onlineGame.players[0], 'heLLo', { x: 7, y: 7, direction: Direction.Vertical });
        onlineGame['placeTemporaryLetter'](action);
        const result = boardService.board.grid[11][7].letterObject.char;
        const expected = 'O';
        expect(result).toEqual(expected);
    });

    it('should get the winner', () => {
        const p1: LightPlayer = {
            name: 'p1',
            points: 0,
            letterRack: [
                { char: 'A', value: 1 },
                { char: 'B', value: 1 },
                { char: 'C', value: 1 },
            ],
        };

        const p2: LightPlayer = {
            name: 'p2',
            points: 0,
            letterRack: [
                { char: 'D', value: 1 },
                { char: 'E', value: 1 },
                { char: 'F', value: 1 },
            ],
        };

        const gameState: GameState = {
            players: [p1, p2],
            activePlayerIndex: 0,
            grid: boardService.board.grid,
            lettersRemaining: 96,
            isEndOfGame: true,
            winnerIndex: [0],
        };
        gameSocketHandlerService['gameStateSubject'].next(gameState);
        const result = onlineGame.getWinner();
        const expected = [player1];
        expect(result).toEqual(expected);
    });

    it('should throw error because there is the winners name doesnt match', () => {
        const p1: LightPlayer = {
            name: 'p1',
            points: 0,
            letterRack: [
                { char: 'A', value: 1 },
                { char: 'B', value: 1 },
                { char: 'C', value: 1 },
            ],
        };

        const p2: LightPlayer = {
            name: 'p2',
            points: 0,
            letterRack: [
                { char: 'D', value: 1 },
                { char: 'E', value: 1 },
                { char: 'F', value: 1 },
            ],
        };

        const gameState: GameState = {
            players: [p1, p2],
            activePlayerIndex: 0,
            grid: boardService.board.grid,
            lettersRemaining: 96,
            isEndOfGame: true,
            winnerIndex: [0],
        };
        gameSocketHandlerService['gameStateSubject'].next(gameState);
        onlineGame.winnerNames[0] = 'error';

        expect(() => onlineGame.getWinner()).toThrowError('Winner names does not fit with the player names');
    });

    it('should throw error because the active player dont match the game', () => {
        const p1: LightPlayer = {
            name: 'p1',
            points: 0,
            letterRack: [
                { char: 'A', value: 1 },
                { char: 'B', value: 1 },
                { char: 'C', value: 1 },
            ],
        };

        const p2: LightPlayer = {
            name: 'p2',
            points: 0,
            letterRack: [
                { char: 'D', value: 1 },
                { char: 'E', value: 1 },
                { char: 'F', value: 1 },
            ],
        };
        const gameState: GameState = {
            players: [p1, p2],
            activePlayerIndex: 0,
            grid: boardService.board.grid,
            lettersRemaining: 96,
            isEndOfGame: true,
            winnerIndex: [0],
        };

        expect(() => onlineGame['updateActivePlayer'](gameState)).toThrowError(
            'Players received with game state are not matching with those of the first turn',
        );
    });

    it('should throw error because the players dont match the game', () => {
        const p1: LightPlayer = {
            name: 'p1',
            points: 0,
            letterRack: [
                { char: 'A', value: 1 },
                { char: 'B', value: 1 },
                { char: 'C', value: 1 },
            ],
        };

        const p2: LightPlayer = {
            name: 'p2',
            points: 0,
            letterRack: [
                { char: 'D', value: 1 },
                { char: 'E', value: 1 },
                { char: 'F', value: 1 },
            ],
        };
        const gameState: GameState = {
            players: [p1, p2],
            activePlayerIndex: 0,
            grid: boardService.board.grid,
            lettersRemaining: 96,
            isEndOfGame: true,
            winnerIndex: [0],
        };

        expect(() => onlineGame['updatePlayers'](gameState)).toThrowError('The players received in game state does not fit with those in the game');
    });

    it('should check if the letterRack is changed', () => {
        const stateRack = [
            { char: 'A', value: 1 },
            { char: 'A', value: 1 },
            { char: 'B', value: 1 },
            { char: 'C', value: 1 },
        ];
        const player = new Player('QWERTY');
        player.letterRack = [
            { char: 'A', value: 1 },
            { char: 'A', value: 1 },
            { char: 'A', value: 1 },
            { char: 'B', value: 1 },
            { char: 'C', value: 1 },
            { char: 'D', value: 1 },
            { char: 'E', value: 1 },
        ];

        const result = onlineGame['isLetterRackChanged'](stateRack, player);
        expect(result).toBeTruthy();
    });

    it('should check if the letterRack is not changed', () => {
        const stateRack = [
            { char: 'A', value: 1 },
            { char: 'A', value: 1 },
            { char: 'A', value: 1 },
            { char: 'B', value: 1 },
            { char: 'C', value: 1 },
            { char: 'D', value: 1 },
            { char: 'E', value: 1 },
        ];

        const player = new Player('QWERTY');
        player.letterRack = [
            { char: 'A', value: 1 },
            { char: 'A', value: 1 },
            { char: 'A', value: 1 },
            { char: 'B', value: 1 },
            { char: 'C', value: 1 },
            { char: 'D', value: 1 },
            { char: 'E', value: 1 },
        ];

        const result = onlineGame['isLetterRackChanged'](stateRack, player);
        expect(result).toBeFalsy();
    });

    it('should not update the letterRack if theres no changes', () => {
        onlineGame.players[0].letterRack = [
            { char: 'A', value: 1 },
            { char: 'B', value: 1 },
            { char: 'C', value: 1 },
            { char: 'A', value: 1 },
            { char: 'B', value: 1 },
            { char: 'C', value: 1 },
            { char: 'A', value: 1 },
        ];

        const p1: LightPlayer = {
            name: 'p1',
            points: 0,
            letterRack: [
                { char: 'A', value: 1 },
                { char: 'A', value: 1 },
                { char: 'A', value: 1 },
                { char: 'B', value: 1 },
                { char: 'B', value: 1 },
                { char: 'C', value: 1 },
                { char: 'C', value: 1 },
            ],
        };

        const p2: LightPlayer = {
            name: 'p2',
            points: 0,
            letterRack: [
                { char: 'D', value: 1 },
                { char: 'D', value: 1 },
                { char: 'E', value: 1 },
                { char: 'E', value: 1 },
                { char: 'F', value: 1 },
                { char: 'F', value: 1 },
                { char: 'F', value: 1 },
            ],
        };
        const gameState: GameState = {
            players: [p1, p2],
            activePlayerIndex: 0,
            grid: boardService.board.grid,
            lettersRemaining: 96,
            isEndOfGame: true,
            winnerIndex: [0],
        };
        onlineGame.receiveState(gameState);
        const result = onlineGame.players[0].letterRack;
        const expected = [
            { char: 'A', value: 1 },
            { char: 'B', value: 1 },
            { char: 'C', value: 1 },
            { char: 'A', value: 1 },
            { char: 'B', value: 1 },
            { char: 'C', value: 1 },
            { char: 'A', value: 1 },
        ];
        expect(result).toEqual(expected);
    });
});
