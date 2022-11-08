import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';

import { AccountPageComponent } from './account-page.component';

describe('AccountPageComponent', () => {
    let component: AccountPageComponent;
    let fixture: ComponentFixture<AccountPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccountPageComponent],
            imports: [HttpClientTestingModule, AppMaterialModule, BrowserAnimationsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
