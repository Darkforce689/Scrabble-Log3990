import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessagesService } from '@app/chat/services/messages/messages.service';
import { PassTurn } from '@app/game-logic/actions/pass-turn';
import { DEFAULT_TIME_PER_TURN } from '@app/game-logic/constants';
import { BoardService } from '@app/game-logic/game/board/board.service';
import { MockGame } from '@app/game-logic/game/games/mock-game';
import { TimerService } from '@app/game-logic/game/timer/timer.service';
import { Player } from '@app/game-logic/player/player';

describe('PassTurn', () => {
    let game: MockGame;
    const player1: Player = new Player('Tim');
    const player2: Player = new Player('George');
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        const messageService = TestBed.inject(MessagesService);
        const timerService = TestBed.inject(TimerService);
        const boardService = TestBed.inject(BoardService);
        game = new MockGame(DEFAULT_TIME_PER_TURN, timerService, boardService, messageService);
        game.players.push(player1);
        game.players.push(player2);
    });

    it('should create an instance', () => {
        expect(new PassTurn(new Player('Tim'))).toBeTruthy();
    });
});
