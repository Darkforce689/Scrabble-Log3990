/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ClickAndClickoutDirective } from '@app/directives/click-and-clickout.directive';
import { UIInputControllerService } from '@app/game-logic/actions/ui-actions/ui-input-controller.service';
import { UIPlace } from '@app/game-logic/actions/ui-actions/ui-place';
import { NOT_FOUND } from '@app/game-logic/constants';
import { Direction } from '@app/game-logic/direction.enum';
import { UIInput } from '@app/game-logic/interfaces/ui-input';
import { AppMaterialModule } from '@app/modules/material.module';
import { CanvasDrawer } from '@app/pages/game-page/board/canvas-drawer';
import { Observable, Subject } from 'rxjs';
import { BoardComponent } from './board.component';

describe('BoardComponent', () => {
    let component: BoardComponent;
    let fixture: ComponentFixture<BoardComponent>;
    let canvasDrawerMock: CanvasDrawer;
    let inputControllerMock: UIInputControllerService;
    let mockObservableDropEvent: Subject<UIInput>;
    let mockObservableMoveEvent: Subject<UIInput>;
    beforeEach(async () => {
        canvasDrawerMock = jasmine.createSpyObj('CanvasDrawer', ['setIndicator', 'setDirection', 'drawGrid']);
        inputControllerMock = jasmine.createSpyObj('UIInputControllerService', [], ['activeAction', 'dropEvent$', 'moveEvent$']);
        mockObservableDropEvent = new Subject<UIInput>();
        mockObservableMoveEvent = new Subject<UIInput>();
        await TestBed.configureTestingModule({
            declarations: [BoardComponent, ClickAndClickoutDirective],
            providers: [{ provide: UIInputControllerService, useValue: inputControllerMock }],
            imports: [AppMaterialModule, FormsModule, CommonModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        (Object.getOwnPropertyDescriptor(inputControllerMock, 'dropEvent$')?.get as jasmine.Spy<() => Observable<UIInput>>).and.returnValue(
            mockObservableDropEvent,
        );
        (Object.getOwnPropertyDescriptor(inputControllerMock, 'moveEvent$')?.get as jasmine.Spy<() => Observable<UIInput>>).and.returnValue(
            mockObservableMoveEvent,
        );
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onResize should call setupCanvas', () => {
        const spy = spyOn<any>(component, 'setupCanvasDrawer');
        component.onResize();
        expect(spy).toHaveBeenCalled();
    });

    it('canvasClick should emit input', () => {
        const spy = spyOn(component.clickTile, 'emit');

        const mouseEvent = {
            offsetX: 250,
            offsetY: 250,
        };

        component.canvasClick(mouseEvent as MouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('ngDoCheck should enter all condition', () => {
        component.canvasDrawer = canvasDrawerMock;
        const dirAnswer: Direction = Direction.Horizontal;

        const test = new UIPlace(
            jasmine.createSpyObj('GameInfoService', ['void']),
            jasmine.createSpyObj('PointCalculatorService', ['void']),
            inputControllerMock,
        );

        test.pointerPosition = { x: 1, y: 1 };
        test.direction = Direction.Horizontal;
        (Object.getOwnPropertyDescriptor(inputControllerMock, 'activeAction')?.get as jasmine.Spy<() => UIPlace>).and.returnValue(test);
        component.ngDoCheck();
        expect(canvasDrawerMock.setDirection).toHaveBeenCalledWith(dirAnswer);
        expect(canvasDrawerMock.setIndicator).toHaveBeenCalledWith(1, 1);
        expect(canvasDrawerMock.drawGrid).toHaveBeenCalledTimes(1);
    });

    it('ngDoCheck should enter all condition expect if pointerPosition', () => {
        component.canvasDrawer = canvasDrawerMock;

        const test = new UIPlace(
            jasmine.createSpyObj('GameInfoService', ['void']),
            jasmine.createSpyObj('PointCalculatorService', ['void']),
            inputControllerMock,
        );

        (Object.getOwnPropertyDescriptor(inputControllerMock, 'activeAction')?.get as jasmine.Spy<() => UIPlace>).and.returnValue(test);
        component.ngDoCheck();
        expect(canvasDrawerMock.setDirection).not.toHaveBeenCalled();
        expect(canvasDrawerMock.setIndicator).not.toHaveBeenCalled();
        expect(canvasDrawerMock.drawGrid).toHaveBeenCalledTimes(1);
    });

    it('ngDoCheck should NOT enter second condition if pointerPosition is not defined', () => {
        component.canvasDrawer = canvasDrawerMock;
        const test = {} as UIPlace;

        (Object.getOwnPropertyDescriptor(inputControllerMock, 'activeAction')?.get as jasmine.Spy<() => UIPlace>).and.returnValue(test);
        component.ngDoCheck();
        expect(canvasDrawerMock.setDirection).not.toHaveBeenCalled();
        expect(canvasDrawerMock.setIndicator).toHaveBeenCalledWith(NOT_FOUND, NOT_FOUND);
        expect(canvasDrawerMock.drawGrid).toHaveBeenCalledTimes(1);
    });
});
