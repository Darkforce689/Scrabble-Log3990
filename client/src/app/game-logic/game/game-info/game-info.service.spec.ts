/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessagesService } from '@app/chat/services/messages/messages.service';
import { OnlineActionCompilerService } from '@app/game-logic/actions/online-actions/online-action-compiler.service';
import { DEFAULT_TIME_PER_TURN, EMPTY_CHAR, NOT_FOUND } from '@app/game-logic/constants';
import { BoardService } from '@app/game-logic/game/board/board.service';
import { MockGame } from '@app/game-logic/game/games/mock-game';
import { OnlineGame } from '@app/game-logic/game/games/online-game/online-game';
import { TimerService } from '@app/game-logic/game/timer/timer.service';
import { Player } from '@app/game-logic/player/player';
import { LeaderboardService } from '@app/leaderboard/leaderboard.service';
import { AccountService } from '@app/services/account.service';
import { GameSocketHandlerService } from '@app/socket-handler/game-socket-handler/game-socket-handler.service';
import { Observable } from 'rxjs';
import { GameInfoService } from './game-info.service';

describe('GameInfoService', () => {
    let service: GameInfoService;
    let game: MockGame;
    let timer: TimerService;
    let board: BoardService;
    let messages: MessagesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(GameInfoService);
        timer = TestBed.inject(TimerService);
        board = TestBed.inject(BoardService);
        messages = TestBed.inject(MessagesService);

        game = new MockGame(DEFAULT_TIME_PER_TURN, timer, board, messages);
        game.players = [new Player('p1'), new Player('p2')];
        game.start();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should throw Error for getPlayer() if no players were received', () => {
        for (let i = 0; i < game.players.length; i++) {
            expect(() => {
                service.getPlayer(i);
            }).toThrowError('No Players in GameInfo');
        }
    });

    it('should throw Error for getPlayerScore() if no players were received', () => {
        for (let i = 0; i < game.players.length; i++) {
            expect(() => {
                service.getPlayerScore(i);
            }).toThrowError('No Players in GameInfo');
        }
    });

    it('should throw Error for activePlayer if no players were received', () => {
        expect(() => {
            const p = service.activePlayer;
            p.toString();
        }).toThrowError('No Players in GameInfo');
    });

    it('should return -1 for numberOfPlayers if there are no players', () => {
        expect(service.numberOfPlayers).toBe(NOT_FOUND);
    });

    it('should return -1 for numberOfLettersRemaining if there is no game', () => {
        expect(service.numberOfLettersRemaining).toBe(NOT_FOUND);
    });

    it('should return the time left for a turn from the Timer', () => {
        expect(service.timeLeftForTurn).toBeTruthy();
    });

    it('should get timeLeft percentage properly', () => {
        expect(service.timeLeftPercentForTurn).toBeInstanceOf(Observable);
    });

    it('should properly store the player', () => {
        const player = new Player('p1');
        service.receivePlayer(player);
        expect(service.player).toBeTruthy();
        expect(service.player.name).toBe(player.name);
    });

    it('should return the player with provided index', () => {
        service.receiveGame(game);
        expect(service.getPlayer(0)).toEqual(game.players[0]);
        expect(service.getPlayer(1)).toEqual(game.players[1]);
    });

    it('should return the player points with provided index', () => {
        const testPoints = 1000;
        service.receiveGame(game);
        game.players[0].points = Math.floor(Math.random() * testPoints);
        game.players[1].points = Math.floor(Math.random() * testPoints);
        expect(service.getPlayerScore(0)).toBe(game.players[0].points);
        expect(service.getPlayerScore(1)).toBe(game.players[1].points);
    });

    it('should return the number of players', () => {
        service.players = [new Player('p1'), new Player('p2')];
        expect(service.numberOfPlayers).toBe(service.players.length);
    });

    it('should return the number of players', () => {
        service.players = [new Player('p1'), new Player('p2')];
        expect(service.numberOfPlayers).toBe(service.players.length);
    });

    it('should return the number of letters remaining', () => {
        game.lettersRemaining = 88;
        service.receiveGame(game);
        const result = service.numberOfLettersRemaining;
        const expected = 88;
        expect(result).toEqual(expected);
    });

    it('should get the active player', () => {
        game.activePlayerIndex = 0;
        service.receiveGame(game);
        const result = service.activePlayer;
        const expected = game.players[0];
        expect(result).toEqual(expected);
    });

    it('should return that the game is not online', () => {
        service.receiveGame(game);
        const result = service.isOnlineGame;
        expect(result).toBeFalsy();
    });

    it('should get the gameId offline', () => {
        service.receiveGame(game);
        const result = service.gameId;
        const expected = '';
        expect(result).toEqual(expected);
    });

    it('should return empty array for winner when no game', () => {
        expect(service.winner).toEqual([]);
    });

    it('should return empty string for gameID when there is no game', () => {
        expect(service.gameId).toBe(EMPTY_CHAR);
    });

    it('should return empty string for gameID when there is no game', () => {
        expect(service.gameId).toBe(EMPTY_CHAR);
    });
});

describe('GameInfoService Online Edition', () => {
    let service: GameInfoService;
    let onlineGame: OnlineGame;
    let timer: TimerService;
    let board: BoardService;
    const accountService = { account: { name: 'Tim' } };

    const leaderboardServiceMock = jasmine.createSpyObj('LeaderboardService', ['updateLeaderboard']);
    const accountServiceMock = jasmine.createSpyObj('AccountService', ['actualizeAccount'], {
        account: {
            name: 'p1',
            _id: '1',
            email: 'a@b.c',
        },
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: AccountService, useValue: accountServiceMock },
                { provide: LeaderboardService, useValue: leaderboardServiceMock },
                { provide: AccountService, useValue: accountService },
            ],
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(GameInfoService);
        timer = TestBed.inject(TimerService);
        board = TestBed.inject(BoardService);

        onlineGame = new OnlineGame(
            '0',
            DEFAULT_TIME_PER_TURN,
            timer,
            new GameSocketHandlerService(),
            board,
            TestBed.inject(OnlineActionCompilerService),
            accountServiceMock,
        );
        onlineGame.players = [new Player('p1'), new Player('p2')];
    });

    it('should return the number of letters remaining', () => {
        service.receiveGame(onlineGame);
        const result = service.numberOfLettersRemaining;
        const expected = 0;
        expect(result).toEqual(expected);
    });

    it('should get the active player', () => {
        onlineGame.players = [new Player('p1'), new Player('p2')];
        onlineGame.activePlayerIndex = 0;
        service.receiveGame(onlineGame);
        const result = service.activePlayer;
        const expected = onlineGame.players[0];
        expect(result).toEqual(expected);
    });

    it('should get the endOfGame status', () => {
        service.receiveGame(onlineGame);
        const result = service.isEndOfGame;
        const expected = false;
        expect(result).toEqual(expected);
    });

    it('should get the winner', () => {
        const p1 = new Player('p1');
        spyOn(onlineGame, 'getWinner').and.returnValue([p1]);
        service.receiveGame(onlineGame);
        const result = service.winner;
        const expected: Player[] = [p1];
        expect(result).toEqual(expected);
    });

    it('should return that the game is online', () => {
        service.receiveGame(onlineGame);
        const result = service.isOnlineGame;
        expect(result).toBeTruthy();
    });

    it('should get the gameId online', () => {
        service.receiveGame(onlineGame);
        const result = service.gameId;
        const expected = '0';
        expect(result).toEqual(expected);
    });

    it('should return false for isEndOfGame when there is no game', () => {
        expect(service.isEndOfGame).toBeFalsy();
    });

    it('#is magic game should return false when there is no game', () => {
        expect(service.isMagicGame).toBeFalse();
    });
});
