/* eslint-disable no-underscore-dangle */
import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { AfterContentChecked, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { JokerDialogComponent } from '@app/components/modals/joker-dialog/joker-dialog.component';
import { UIDragAndDrop } from '@app/game-logic/actions/ui-actions/ui-drag-and-drop';
import { UIExchange } from '@app/game-logic/actions/ui-actions/ui-exchange';
import { UIInputControllerService } from '@app/game-logic/actions/ui-actions/ui-input-controller.service';
import { UIMove } from '@app/game-logic/actions/ui-actions/ui-move';
import { UIPlace } from '@app/game-logic/actions/ui-actions/ui-place';
import { JOKER_CHAR, NOT_FOUND } from '@app/game-logic/constants';
import { Letter } from '@app/game-logic/game/board/letter.interface';
import { GameInfoService } from '@app/game-logic/game/game-info/game-info.service';
import { GameManagerService } from '@app/game-logic/game/games/game-manager/game-manager.service';
import { InputComponent, InputType, UIInput } from '@app/game-logic/interfaces/ui-input';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-horse',
    templateUrl: './horse.component.html',
    styleUrls: ['./horse.component.scss'],
})
export class HorseComponent implements AfterContentChecked, OnInit, OnDestroy {
    @Output() clickLetter = new EventEmitter();
    @Output() dropEvent = new EventEmitter();
    @Output() moveEvent = new EventEmitter();
    readonly self = InputComponent.Horse;

    inputType = InputType;

    playerRack: Letter[];

    // eslint-disable-next-line no-undef
    timeoutHandler?: NodeJS.Timeout;
    holdingIndex: number;
    canPlace: boolean;
    mapIndexToEvent: Map<number, CdkDragEnd> = new Map<number, CdkDragEnd>();
    mapIndexToPosition: Map<number, { left: number; top: number; x: number; y: number }> = new Map<
        number,
        { left: number; top: number; x: number; y: number }
    >();
    lastSelectedChar: string | undefined = undefined;

    private moveFeedback$$: Subscription;
    private dropFeedback$$: Subscription;
    private resetIndex$$: Subscription;

    constructor(
        private info: GameInfoService,
        private inputController: UIInputControllerService,
        private dialog: MatDialog,
        private gameManager: GameManagerService,
    ) {
        this.moveFeedback$$ = this.inputController.moveFeedback$.subscribe((canPlace: boolean) => {
            this.receiveMoveFeedback(canPlace);
        });
        this.dropFeedback$$ = this.inputController.dropFeedback$.subscribe(
            (event: { left: number; top: number; index: number; x: number; y: number }) => {
                this.receiveDropFeedback(event);
            },
        );
        this.resetIndex$$ = this.inputController.resetIndex$.subscribe(() => {
            this.resetIndexes();
        });
    }

    ngOnInit() {
        this.holdingIndex = NOT_FOUND;
        this.canPlace = false;
        this.resetIndexes();
    }

    ngOnDestroy() {
        this.dropFeedback$$.unsubscribe();
        this.moveFeedback$$.unsubscribe();
        this.resetIndex$$.unsubscribe();
    }

    ngAfterContentChecked(): void {
        this.playerRack = this.info.player.letterRack;
    }

    click(event: MouseEvent, index: number) {
        if (this.isHolding(index)) {
            this.holdingIndex = NOT_FOUND;
            return;
        }
        if (event.button === 0) {
            if (this.isDropped(index)) {
                const mappedEvent = this.mapIndexToEvent.get(index);
                if (mappedEvent) {
                    mappedEvent.source._dragRef.reset();
                    const boundingRect = mappedEvent.source.element.nativeElement.getBoundingClientRect();
                    const lastPosition = this.mapIndexToPosition.get(index);
                    if (!lastPosition) return;
                    mappedEvent.source._dragRef.setFreeDragPosition({
                        x: lastPosition.left - boundingRect.left + 1,
                        y: lastPosition.top - boundingRect.top + 1,
                    });
                }
            }
            this.leftClick(index);
        } else if (event.button === 2) {
            // right click
            const input: UIInput = { from: InputComponent.Horse, type: InputType.RightClick, args: index };
            this.clickLetter.emit(input);
        }
    }

    onDragMoved(event: CdkDragMove, index: number) {
        if (this.holdingIndex === NOT_FOUND) return;
        const input: UIInput = { from: InputComponent.Horse, type: InputType.HoldReleased, args: index, dropPoint: event.pointerPosition };
        this.moveEvent.emit(input);
    }

    drop(event: CdkDragEnd, index: number) {
        if (this.timeoutHandler) {
            event.source._dragRef.reset();
        } else {
            if (this.info.activePlayer.letterRack[index].char === JOKER_CHAR) {
                if (!this.canPlace) {
                    const input: UIInput = { from: InputComponent.Horse, type: InputType.HoldReleased, args: index, dropPoint: { x: -1, y: -1 } };
                    this.dropEvent.emit(input);
                    event.source._dragRef.reset();
                    return;
                }
                const dialogRef = this.dialog.open(JokerDialogComponent);
                this.info.endTurn$.subscribe(() => {
                    dialogRef.close();
                });
                dialogRef.afterClosed().subscribe((char: string) => {
                    if (char && char.length === 1) {
                        this.mapIndexToEvent.set(index, event);
                        this.lastSelectedChar = char;
                        const input: UIInput = {
                            from: InputComponent.Horse,
                            type: InputType.HoldReleased,
                            args: index,
                            dropPoint: event.dropPoint,
                            selectedChar: this.lastSelectedChar,
                        };
                        this.dropEvent.emit(input);
                    } else {
                        this.canPlace = false;
                        const input: UIInput = { from: InputComponent.Horse, type: InputType.HoldReleased, args: index, dropPoint: { x: -1, y: -1 } };
                        this.dropEvent.emit(input);
                        event.source._dragRef.reset();
                    }
                });
            } else {
                if (!this.canPlace) {
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    const input: UIInput = { from: InputComponent.Horse, type: InputType.HoldReleased, args: index, dropPoint: { x: -1, y: -1 } };
                    this.dropEvent.emit(input);
                    event.source._dragRef.reset();
                    return;
                }
                this.mapIndexToEvent.set(index, event);
                const input: UIInput = {
                    from: InputComponent.Horse,
                    type: InputType.HoldReleased,
                    args: index,
                    dropPoint: event.dropPoint,
                };
                this.dropEvent.emit(input);
            }
        }
    }

    onMouseDown(event: MouseEvent, index: number) {
        if (event.button !== 0 || this.cantDragAndDrop) return;
        // left click only
        this.timeoutHandler = setTimeout(() => {
            // start holding, no longer a click
            this.holdingIndex = index;
            this.timeoutHandler = undefined;
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        }, 300);
    }

    leftClick(index: number) {
        if (this.timeoutHandler) clearTimeout(this.timeoutHandler);
        this.timeoutHandler = undefined;

        this.holdingIndex = NOT_FOUND;
        const input: UIInput = { from: InputComponent.Horse, type: InputType.LeftClick, args: index };
        this.clickLetter.emit(input);
    }

    receiveMoveFeedback(canPlace: boolean) {
        this.canPlace = canPlace;
    }

    receiveDropFeedback(event: { left: number; top: number; index: number; x: number; y: number }) {
        let foundIndex = NOT_FOUND;
        this.holdingIndex = NOT_FOUND;
        this.mapIndexToPosition.forEach((value, key) => {
            if (foundIndex !== NOT_FOUND) return;
            if (value.x === event.x && value.y === event.y && key !== event.index) {
                foundIndex = key;
                const char = this.playerRack[event.index].char !== JOKER_CHAR ? this.playerRack[event.index].char : this.lastSelectedChar;
                this.inputController.replaceOldTempPos({ x: value.x, y: value.y, rackIndex: event.index }, char);
            }
        });
        if (foundIndex !== NOT_FOUND) this.resetAnIndex(foundIndex);
        this.mapIndexToPosition.set(event.index, { left: event.left, top: event.top, x: event.x, y: event.y });
        const mappedEvent = this.mapIndexToEvent.get(event.index);
        if (mappedEvent) {
            mappedEvent.source._dragRef.reset();
            const boundingRect = mappedEvent.source.element.nativeElement.getBoundingClientRect();
            mappedEvent.source._dragRef.setFreeDragPosition({ x: event.left - boundingRect.left + 1, y: event.top - boundingRect.top + 1 });
        }
    }

    resetIndexes() {
        this.mapIndexToEvent.forEach((value) => {
            value.source._dragRef.reset();
        });
        this.mapIndexToEvent.clear();
    }

    resetAnIndex(index: number) {
        const event = this.mapIndexToEvent.get(index);
        if (!event) return;
        event.source._dragRef.reset();
        this.mapIndexToPosition.delete(index);
        this.mapIndexToEvent.delete(index);
    }

    isLetterSelectedForMove(index: number) {
        if (this.inputController.activeAction instanceof UIMove) {
            return this.inputController.activeAction.concernedIndexes.has(index);
        }
        return false;
    }

    isLetterSelectedForExchange(index: number) {
        if (this.inputController.activeAction instanceof UIExchange) {
            return this.inputController.activeAction.concernedIndexes.has(index);
        }
        return false;
    }

    isLetterSelectedForPlace(index: number) {
        if (this.inputController.activeAction instanceof UIPlace) {
            return this.inputController.activeAction.concernedIndexes.has(index);
        }
        return false;
    }

    isHolding(index: number) {
        return !this.timeoutHandler && index === this.holdingIndex;
    }

    isDropped(index: number) {
        return (
            index !== this.holdingIndex &&
            this.inputController.activeAction instanceof UIDragAndDrop &&
            this.inputController.activeAction.concernedIndexes.has(index)
        );
    }

    get isObserver() {
        return !this.info.players.find(({ name }) => name === this.gameManager.userName);
    }

    get cantDragAndDrop(): boolean {
        return this.isObserver || !this.info.isActivePlayer || this.inputController.activeAction instanceof UIPlace;
    }
}
