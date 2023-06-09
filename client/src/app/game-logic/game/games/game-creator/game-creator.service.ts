import { Injectable } from '@angular/core';
import { OnlineActionCompilerService } from '@app/game-logic/actions/online-actions/online-action-compiler.service';
import { BoardService } from '@app/game-logic/game/board/board.service';
import { OnlineGameCreationParams } from '@app/game-logic/game/games/game-creator/game-creation-params';
import { MagicOnlineGame } from '@app/game-logic/game/games/magic-game/magic-game';
import { OnlineGame } from '@app/game-logic/game/games/online-game/online-game';
import { TimerService } from '@app/game-logic/game/timer/timer.service';
import { AccountService } from '@app/services/account.service';
import { GameSocketHandlerService } from '@app/socket-handler/game-socket-handler/game-socket-handler.service';

@Injectable({
    providedIn: 'root',
})
export class GameCreatorService {
    constructor(
        private timer: TimerService,
        private boardService: BoardService,
        private gameSocketHandler: GameSocketHandlerService,
        private onlineActionCompiler: OnlineActionCompilerService,
        private accountService: AccountService,
    ) {}

    createMagicOnlineGame(gameCreationParams: OnlineGameCreationParams): MagicOnlineGame {
        return new MagicOnlineGame(
            gameCreationParams.id,
            gameCreationParams.timePerTurn,
            this.timer,
            this.gameSocketHandler,
            this.boardService,
            this.onlineActionCompiler,
            this.accountService,
        );
    }

    createOnlineGame(gameCreationParams: OnlineGameCreationParams): OnlineGame {
        return new OnlineGame(
            gameCreationParams.id,
            gameCreationParams.timePerTurn,
            this.timer,
            this.gameSocketHandler,
            this.boardService,
            this.onlineActionCompiler,
            this.accountService,
        );
    }
}
