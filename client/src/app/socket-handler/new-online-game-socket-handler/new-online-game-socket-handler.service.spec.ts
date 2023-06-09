/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { WAIT_STATUS } from '@app/game-logic/constants';
import { SocketMock } from '@app/game-logic/socket-mock';
import { AccountService } from '@app/services/account.service';
import { BotDifficulty } from '@app/services/bot-difficulty';
import { GameMode } from '@app/socket-handler/interfaces/game-mode.interface';
import { OnlineGameSettings, OnlineGameSettingsUI } from '@app/socket-handler/interfaces/game-settings-multi.interface';
import { NewOnlineGameSocketHandler } from '@app/socket-handler/new-online-game-socket-handler/new-online-game-socket-handler.service';
import { first, skip, take } from 'rxjs/operators';
import { Socket } from 'socket.io-client';

describe('NewOnlineGameSocketHandler', () => {
    let service: NewOnlineGameSocketHandler;
    let createSocketFunction: () => Socket;
    const gameSettings = {
        id: '1',
        timePerTurn: 60000,
        playerNames: ['allo1'],
        privateGame: false,
        gameStatus: WAIT_STATUS,
        randomBonus: false,
        gameMode: GameMode.Classic,
        botDifficulty: BotDifficulty.Easy,
        numberOfPlayers: 2,
        magicCardIds: [],
        tmpPlayerNames: [],
        password: undefined,
        botNames: [],
    } as OnlineGameSettingsUI;
    const accountService = { account: { name: 'Tim' } };

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [{ provide: AccountService, useValue: accountService }], imports: [HttpClientTestingModule] });
        service = TestBed.inject(NewOnlineGameSocketHandler);
        createSocketFunction = service['connectToSocket'];
        service['connectToSocket'] = jasmine.createSpy().and.returnValue(new SocketMock());
        service['connect']();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createGame should throw error if game settings are not valid', () => {
        expect(() => {
            service.createGame({} as OnlineGameSettings);
        }).toThrowError();
    });

    it('createGame should emit createGame if game settings are valid and receive pendingGameId', () => {
        const spyWaitingForPlayer = spyOn<any>(service, 'waitForOtherPlayers').and.callThrough();
        service.createGame(gameSettings);
        expect(spyWaitingForPlayer).toHaveBeenCalled();
        service.pendingGameId$.pipe(skip(1)).subscribe((value) => {
            expect(value).toEqual('aa');
        });
        (service.socket as any).peerSideEmit('pendingGameId', 'aa');
    });

    it('join pending game should emit joinGame and receive GameSettings', () => {
        spyOnProperty(service.socket, 'connected', 'get').and.returnValue(true);
        spyOn<any>(service, 'listenForUpdatedGameSettings').and.callThrough();
        spyOn(service, 'disconnectSocket').and.callThrough();
        service.joinPendingGame('abc', '');
        expect(service['listenForUpdatedGameSettings']).toHaveBeenCalled();

        (service.socket as any).peerSideEmit('gameStarted', gameSettings);
        service['listenForUpdatedGameSettings']();
        service.gameStarted$.pipe(first()).subscribe((gameSettingsServer) => {
            expect(gameSettingsServer).not.toBeUndefined();
        });
    });

    it('listenForPendingGames should return pending games', () => {
        const pendingGamesSettings = [gameSettings];
        const observableGamesSettings = [gameSettings];

        service.pendingGames$.pipe().subscribe((value) => {
            expect(value).not.toBeUndefined();
        });
        service.listenForPendingGames();
        (service.socket as any).peerSideEmit('pendingGames', { pendingGamesSettings, observableGamesSettings });
    });

    it('listenForError should return error message', () => {
        const errorMessage = 'Cant create game';
        service.error$.pipe(first()).subscribe((value: string) => {
            expect(value).toMatch(errorMessage);
        });
        service['listenErrorMessage']();
        (service.socket as any).peerSideEmit('error', errorMessage);
    });

    it('disconnect if connect to server fail', () => {
        service['connect']();
        service.isDisconnected$.pipe(take(1)).subscribe((value) => {
            expect(value).toBeTrue();
        });
        (service.socket as any).peerSideEmit('connect_error', true);
    });

    it('should not disconnect if socket not connected', () => {
        const spyDisconnect = spyOn(service.socket, 'disconnect');
        (service.socket as any) = undefined;
        service.disconnectSocket();
        expect(spyDisconnect).not.toHaveBeenCalled();
    });

    it('should resetGameToken ', () => {
        service.gameStarted$.subscribe((value) => {
            expect(value).toBeUndefined();
        });
        service.resetGameToken();
    });

    it('connectToSocket should create socket', () => {
        expect(createSocketFunction().disconnected).toBeTrue();
    });
});
