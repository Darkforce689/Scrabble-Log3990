import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormArray, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DEFAULT_NUMBER_OF_PLAYERS, DEFAULT_TIME_PER_TURN } from '@app/game-logic/constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { BotDifficulty } from '@app/services/bot-difficulty';
import { GameMode } from '@app/socket-handler/interfaces/game-mode.interface';
import { NewOnlineGameFormComponent } from './new-online-game-form.component';

describe('NewOnlineGameFormComponent', () => {
    let component: NewOnlineGameFormComponent;
    let fixture: ComponentFixture<NewOnlineGameFormComponent>;

    const mockDialog = {
        close: () => {
            return;
        },
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [FormsModule, ReactiveFormsModule, BrowserAnimationsModule, AppMaterialModule],
                providers: [
                    { provide: MAT_DIALOG_DATA, useValue: {} },
                    { provide: MatDialogRef, useValue: mockDialog },
                ],
                declarations: [NewOnlineGameFormComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(NewOnlineGameFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call cancel method on button cancel pressed', () => {
        const domElement = fixture.nativeElement as HTMLElement;
        const cancelButton = domElement.querySelectorAll('button')[0];
        spyOn(component, 'cancel');
        cancelButton.click();
        expect(component.cancel).toHaveBeenCalled();
    });

    it('play should not be responsive if form not complete', () => {
        const domElement = fixture.nativeElement as HTMLElement;
        const cancelButton = domElement.querySelectorAll('button')[0];
        const spy = spyOn(component, 'playGame');
        cancelButton.click();
        expect(spy.calls.count()).toBe(0);
    });

    it('play should call playGame if form complete and button pressed', () => {
        const dom = fixture.nativeElement as HTMLElement;
        const playButton = dom.querySelectorAll('button')[1];

        component.onlineGameSettingsUIForm.setValue({
            timePerTurn: 60000,
            privateGame: false,
            randomBonus: true,
            numberOfPlayers: 4,
            hasPassword: false,
            password: '',
            botDifficulty: BotDifficulty.Easy,
        });
        component.onlineGameSettingsUIForm.updateValueAndValidity();
        fixture.detectChanges();
        spyOn(component, 'playGame');
        playButton.click();
        fixture.detectChanges();
        expect(component.playGame).toHaveBeenCalled();
    });

    it('play should not call playGame if no magic card selected and button pressed when magic game', () => {
        const dom = fixture.nativeElement as HTMLElement;
        const playButton = dom.querySelectorAll('button')[1];
        component.gameMode = GameMode.Magic;
        component.onlineGameSettingsUIForm.setValue({
            timePerTurn: 60000,
            privateGame: false,
            randomBonus: true,
            numberOfPlayers: 4,
            hasPassword: false,
            password: '',
            botDifficulty: BotDifficulty.Easy,
        });
        component.onlineGameSettingsUIForm.updateValueAndValidity();
        fixture.detectChanges();
        spyOn(component, 'playGame');
        playButton.click();
        fixture.detectChanges();
        expect(component.playGame).not.toHaveBeenCalled();
    });

    it('play should call playGame if a magic card is selected and button pressed when magic game', () => {
        const dom = fixture.nativeElement as HTMLElement;
        const playButton = dom.querySelectorAll('button')[1];
        component.gameMode = GameMode.Magic;
        component.onlineGameSettingsUIForm.setValue({
            privateGame: false,
            randomBonus: true,
            numberOfPlayers: 4,
            timePerTurn: 60000,
            hasPassword: false,
            password: '',
            botDifficulty: BotDifficulty.Easy,
        });
        fixture.detectChanges();
        (component.onlineGameSettingsUIForm.controls.magicCardIds as FormArray).push(new FormControl('ANY_MAGIC_CARD_ID'));
        component.onlineGameSettingsUIForm.updateValueAndValidity();
        fixture.detectChanges();
        spyOn(component, 'playGame');
        playButton.click();
        fixture.detectChanges();
        expect(component.playGame).toHaveBeenCalled();
    });

    it('setting should return group form value', () => {
        const settings = {
            timePerTurn: 60000,
            privateGame: false,
            randomBonus: true,
            numberOfPlayers: 4,
            hasPassword: false,
            password: '',
            botDifficulty: BotDifficulty.Easy,
        };
        component.onlineGameSettingsUIForm.setValue(settings);
        expect(component.onlineGameSettingsUIForm.value).toEqual({
            timePerTurn: 60000,
            privateGame: false,
            randomBonus: true,
            numberOfPlayers: 4,
            hasPassword: false,
            botDifficulty: BotDifficulty.Easy,
        });
    });

    it('playGame should close the dialog', () => {
        spyOn(mockDialog, 'close');
        component.onlineGameSettingsUIForm.setValue({
            timePerTurn: DEFAULT_TIME_PER_TURN,
            privateGame: false,
            randomBonus: false,
            numberOfPlayers: DEFAULT_NUMBER_OF_PLAYERS,
            hasPassword: false,
            password: '',
            botDifficulty: BotDifficulty.Easy,
        });
        component.playGame();
        expect(mockDialog.close).toHaveBeenCalled();
    });

    it('cancel should close the dialog and reset form', () => {
        const setting = {
            timePerTurn: 60000,
            privateGame: false,
            randomBonus: true,
            numberOfPlayers: 4,
            hasPassword: false,
            password: '',
            botDifficulty: BotDifficulty.Expert,
        };
        component.onlineGameSettingsUIForm.setValue(setting);
        spyOn(mockDialog, 'close');
        component.cancel();
        expect(mockDialog.close).toHaveBeenCalled();
        expect(component.onlineGameSettingsUIForm.value).toEqual({
            timePerTurn: DEFAULT_TIME_PER_TURN,
            privateGame: false,
            randomBonus: false,
            numberOfPlayers: DEFAULT_NUMBER_OF_PLAYERS,
            hasPassword: false,
            botDifficulty: BotDifficulty.Easy,
        });
    });
});
