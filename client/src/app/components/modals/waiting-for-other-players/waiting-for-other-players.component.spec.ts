import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { NewOnlineGameSocketHandler } from '@app/socket-handler/new-online-game-socket-handler/new-online-game-socket-handler.service';
import { Observable, Subject } from 'rxjs';
import { WaitingForOtherPlayersComponent } from './waiting-for-other-players.component';

const mockDialogRef = {
    close: jasmine.createSpy('close'),
};

describe('WaitingForOtherPlayersComponent', () => {
    let component: WaitingForOtherPlayersComponent;
    let fixture: ComponentFixture<WaitingForOtherPlayersComponent>;
    let onlineSocketHandlerSpy: jasmine.SpyObj<NewOnlineGameSocketHandler>;
    let matDialog: jasmine.SpyObj<MatDialog>;
    let pendingGameId$: Subject<string>;

    beforeEach(async () => {
        matDialog = jasmine.createSpyObj('MatDialog', ['open']);
        onlineSocketHandlerSpy = jasmine.createSpyObj(
            'NewOnlineGameSocketHandler',
            ['createGame', 'listenForPendingGames', 'disconnectSocket', 'joinPendingGame', 'launchGame'],
            ['pendingGames$', 'pendingGameId$'],
        );
        await TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, AppMaterialModule],

            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MatDialog, useValue: matDialog },
                { provide: NewOnlineGameSocketHandler, useValue: onlineSocketHandlerSpy },
            ],
            declarations: [WaitingForOtherPlayersComponent],
        }).compileComponents();

        pendingGameId$ = new Subject<string>();
        (Object.getOwnPropertyDescriptor(onlineSocketHandlerSpy, 'pendingGameId$')?.get as jasmine.Spy<() => Observable<string>>).and.returnValue(
            pendingGameId$,
        );
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingForOtherPlayersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('cancel', () => {
        const dom = fixture.nativeElement as HTMLElement;
        const cancelButton = dom.querySelectorAll('button')[0];
        spyOn(component, 'cancel');
        cancelButton.click();
        expect(component.cancel).toHaveBeenCalled();
    });

    it('should disconnect socket on cancel', () => {
        component.cancel();
        expect(onlineSocketHandlerSpy.disconnectSocket).toHaveBeenCalled();
    });

    it('launchGame should call launchGame', () => {
        const dom = fixture.nativeElement as HTMLElement;
        onlineSocketHandlerSpy.isGameOwner = true;
        fixture.detectChanges();
        const launchButton = dom.querySelectorAll('button')[1];
        spyOn(component, 'launchGame');
        launchButton.click();
        expect(component.launchGame).toHaveBeenCalled();
    });
});