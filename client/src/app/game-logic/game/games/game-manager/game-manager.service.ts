import { Injectable } from '@angular/core';
import { MessagesService } from '@app/chat/services/messages/messages.service';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';
import { OnlineGameCreationParams } from '@app/game-logic/game/games/game-creator/game-creation-params';
import { GameCreatorService } from '@app/game-logic/game/games/game-creator/game-creator.service';
import { PlayerInfoForfeit } from '@app/game-logic/game/games/online-game/game-state';
import { OnlineGame } from '@app/game-logic/game/games/online-game/online-game';
import { Player } from '@app/game-logic/player/player';
import { GameSocketHandlerService } from '@app/socket-handler/game-socket-handler/game-socket-handler.service';
import { GameMode } from '@app/socket-handler/interfaces/game-mode.interface';
import { OnlineGameSettings } from '@app/socket-handler/interfaces/game-settings-multi.interface';
import { Observable, Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class GameManagerService {
    userName = '';
    private game: OnlineGame | undefined;

    private newGameSubject = new Subject<void>();
    get newGame$(): Observable<void> {
        return this.newGameSubject;
    }

    private disconnectedFromServerSubject = new Subject<void>();
    get disconnectedFromServer$(): Observable<void> {
        return this.disconnectedFromServerSubject;
    }

    get forfeitGameState$(): Observable<PlayerInfoForfeit> {
        return this.gameSocketHandler.forfeitGameState$;
    }

    get isInGame() {
        return !!this.game;
    }

    constructor(
        private messageService: MessagesService,
        private info: GameInfoService,
        private gameSocketHandler: GameSocketHandlerService,
        private gameCreator: GameCreatorService,
    ) {
        this.gameSocketHandler.disconnectedFromServer$.subscribe(() => {
            this.disconnectedFromServerSubject.next();
        });

        this.forfeitGameState$.subscribe((playerInfo: PlayerInfoForfeit) => {
            this.updatePlayerInfo(playerInfo);
        });
    }

    updatePlayerInfo(playerInfo: PlayerInfoForfeit) {
        if (!this.game) {
            return;
        }
        const newName = playerInfo.name;
        const previousName = playerInfo.previousPlayerName;
        const index = this.game.players.findIndex((player) => player.name === previousName);

        this.game.players[index].name = newName;
        const playerRef = this.game.playersWithIndex.get(previousName)?.player;
        if (!playerRef) {
            return;
        }
        this.game.playersWithIndex.delete(playerInfo.name);
        this.game.playersWithIndex.set(newName, { index, player: playerRef });
    }

    joinOnlineGame(gameToken: string, gameSettings: OnlineGameSettings) {
        if (this.game) {
            this.stopGame();
        }
        const timePerTurn = Number(gameSettings.timePerTurn);
        const gameCreationParams: OnlineGameCreationParams = { id: gameSettings.id, timePerTurn };
        this.game = this.createOnlineGame(gameCreationParams, gameSettings.gameMode);
        this.userName = this.game.userName;
        const players = this.createOnlinePlayers(gameSettings.playerNames);
        this.allocatePlayers(players);
        this.game.handleUserActions();
        this.info.receiveGame(this.game);
        this.info.receiveTimePerTurn(timePerTurn);
        this.gameSocketHandler.joinGame(gameToken);
    }

    startGame(): void {
        if (!this.game) {
            throw Error('No game created yet');
        }
    }

    stopGame(): void {
        this.game?.stop();
        this.messageService.leaveGameConversation();
        this.game = undefined;
    }

    private createOnlinePlayers(allPlayerNames: string[]): Player[] {
        const players = allPlayerNames.map((playerName) => new Player(playerName));
        const player = players.find((playerRef) => playerRef.name === this.userName);

        if (player) {
            this.info.receivePlayer(player);
            return players;
        }
        this.info.receivePlayer(players[0]);
        return players;
    }

    private allocatePlayers(players: Player[]) {
        if (!this.game) {
            return;
        }
        this.game.players = players;
    }

    private createOnlineGame(gameCreationParams: OnlineGameCreationParams, mode: GameMode) {
        if (mode === GameMode.Classic) {
            return this.gameCreator.createOnlineGame(gameCreationParams);
        }
        return this.gameCreator.createMagicOnlineGame(gameCreationParams);
    }
}
