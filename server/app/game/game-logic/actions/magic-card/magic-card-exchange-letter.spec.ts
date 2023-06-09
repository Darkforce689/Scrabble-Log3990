import { GameHistoryService } from '@app/account/user-game-history/game-history.service';
import { BotDifficulty } from '@app/game/game-logic/player/bot/bot-difficulty';
import { GameCompiler } from '@app/game/game-compiler/game-compiler.service';
import { ExchangeALetter } from '@app/game/game-logic/actions/magic-card/magic-card-exchange-letter';
import { Letter } from '@app/game/game-logic/board/letter.interface';
import { DEFAULT_TIME_PER_TURN } from '@app/game/game-logic/constants';
import { ServerGame } from '@app/game/game-logic/game/server-game';
import { EndOfGame } from '@app/game/game-logic/interface/end-of-game.interface';
import { GameStateToken, SyncStateToken } from '@app/game/game-logic/interface/game-state.interface';
import { Player } from '@app/game/game-logic/player/player';
import { PointCalculatorService } from '@app/game/game-logic/point-calculator/point-calculator.service';
import { TimerController } from '@app/game/game-logic/timer/timer-controller.service';
import { SystemMessagesService } from '@app/messages-service/system-messages-service/system-messages.service';
import { createSinonStubInstance } from '@app/test.util';
import { expect } from 'chai';
import { Subject } from 'rxjs';

describe('ExchangeALetter', () => {
    let game: ServerGame;
    const player1: Player = new Player('Tim');
    const player2: Player = new Player('George');
    const randomBonus = false;
    const pointCalculator = createSinonStubInstance<PointCalculatorService>(PointCalculatorService);
    const gameCompiler = createSinonStubInstance<GameCompiler>(GameCompiler);
    const mockNewGameState$ = new Subject<GameStateToken>();
    const mockNewSyncState$ = new Subject<SyncStateToken>();
    const messagesService = createSinonStubInstance<SystemMessagesService>(SystemMessagesService);
    const timerController = createSinonStubInstance<TimerController>(TimerController);
    const gameHistoryService = createSinonStubInstance<GameHistoryService>(GameHistoryService);
    const mockEndGame$ = new Subject<EndOfGame>();
    beforeEach(() => {
        game = new ServerGame(
            timerController,
            randomBonus,
            DEFAULT_TIME_PER_TURN,
            'default_gameToken',
            pointCalculator,
            gameCompiler,
            messagesService,
            mockNewGameState$,
            mockNewSyncState$,
            mockEndGame$,
            BotDifficulty.Easy,
            gameHistoryService,
        );
        game.players.push(player1);
        game.players.push(player2);
        game.start();
    });

    it('letter rack should be different when exchanging a letter', () => {
        const activePlayer = game.getActivePlayer();
        activePlayer.letterRack[0].char = '5';
        const initialLetterRack: Letter[] = [...activePlayer.letterRack];
        const letterToExchange: Letter = initialLetterRack[0];
        const exchangeALetterAction = new ExchangeALetter(activePlayer, letterToExchange);

        exchangeALetterAction.execute(game);

        const finalLetterRack: Letter[] = activePlayer.letterRack;
        initialLetterRack.sort((a, b) => a.char.charCodeAt(0) - b.char.charCodeAt(0));
        finalLetterRack.sort((a, b) => a.char.charCodeAt(0) - b.char.charCodeAt(0));

        expect(initialLetterRack).not.to.deep.equal(finalLetterRack);
    });
});
