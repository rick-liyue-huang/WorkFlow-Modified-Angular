import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { Identity, IdentityType } from '../../domain';
import { isValidAddr, extractInfo } from '../../utils/identity.util';
import { isValidDate } from '../../utils/date.util';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-indentity-input',
  template: `
    <div>
      <mat-form-field>
        <mat-select
          placeholder="identity type"
          (change)="onIdTypeChange($event.value)"
          [(ngModel)]="identity.identityType"
        >
          <mat-option *ngFor="let type of identityTypes" [value]="type.value">
            {{ type.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <div class="id-input">
      <mat-form-field class="full-width">
        <input
          matInput
          type="text"
          placeholder="Id number"
          (change)="onIdNoChange($event.target.value)"
          [(ngModel)]="identity.identityNo"
        />
        <mat-error>wrong id</mat-error>
      </mat-form-field>
    </div>
  `,
  styles: [
    `
      .id-input {
        flex: 1;
      }
      :host {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: baseline;
      }
    `
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IdentityInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => IdentityInputComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentityInputComponent
  implements ControlValueAccessor, OnInit, OnDestroy {
  identityTypes: { value: IdentityType; label: string }[] = [
    { value: IdentityType.IdCard, label: 'ID Card' },
    { value: IdentityType.Insurance, label: 'Insurance' },
    { value: IdentityType.Passport, label: 'Passport' },
    // { value: IdentityType.Military, label: 'Other' },
    { value: IdentityType.Other, label: 'Other' }
  ];
  identity: Identity = { identityType: null, identityNo: null };
  private _idType = new Subject<IdentityType>();
  private _idNo = new Subject<string>();
  private _sub: Subscription;

  constructor() {}

  private propagateChange = (_: any) => {};

  ngOnInit() {
    const idType$ = this.idType;
    const idNo$ = this.idNo;
    const val$ = combineLatest(idType$, idNo$).pipe(
      map(([_type, _no]) => ({
        identityType: _type,
        identityNo: _no
      }))
    );
    this._sub = val$.subscribe(v => {
      this.identity = v;
      this.propagateChange(v);
    });
  }

  ngOnDestroy() {
    if (this._sub) {
      this._sub.unsubscribe();
    }
  }

  // ???????????????
  public writeValue(obj: Identity) {
    if (obj) {
      this.identity = obj;
    }
  }

  // ???????????????????????????????????? fn ????????????
  // ???????????????????????? emit ??????????????????
  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  // ????????????????????????????????? touched ??????
  public registerOnTouched() {}

  // ??????????????????????????????????????? null ????????????????????????????????????
  validate(c: FormControl): { [key: string]: any } | null {
    if (!c.value) {
      return null;
    }
    switch (c.value.identityType) {
      case IdentityType.IdCard: {
        return this.validateIdNumber(c);
      }
      case IdentityType.Passport: {
        return this.validatePassport(c);
      }
      case IdentityType.Military: {
        return this.validateMilitary(c);
      }
      case IdentityType.Insurance:
      default: {
        return null;
      }
    }
  }

  private validateIdNumber(c: FormControl): { [key: string]: any } | null {
    const val = c.value.identityNo;
    if (val.length !== 18) {
      return {
        idNotValid: true
      };
    }
    const pattern = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}[x0-9]$/;
    let result = false;
    if (pattern.test(val)) {
      const info = extractInfo(val);
      if (isValidAddr(info.addrCode) && isValidDate(info.dateOfBirth)) {
        result = true;
      }
    }
    return result ? null : { idNotValid: true };
  }

  private validatePassport(c: FormControl): { [key: string]: any } | null {
    const value = c.value.identityNo;
    if (value.length !== 9) {
      return { idNotValid: true };
    }
    const pattern = /^[GgEe]\d{8}$/;
    let result = false;
    if (pattern.test(value)) {
      result = true;
    }
    return result ? null : { idNotValid: true };
  }

  private validateMilitary(c: FormControl): { [key: string]: any } | null {
    const value = c.value.identityNo;
    const pattern = /[\u4e00-\u9fa5](??????)(\d{4,8})(????)$/;
    let result = false;
    if (pattern.test(value)) {
      result = true;
    }
    return result ? null : { idNotValid: true };
  }

  onIdTypeChange(idType: IdentityType) {
    this._idType.next(idType);
  }

  onIdNoChange(idNo: string) {
    this._idNo.next(idNo);
  }

  private get idType(): Observable<IdentityType> {
    return this._idType.asObservable();
  }

  private get idNo(): Observable<string> {
    return this._idNo.asObservable();
  }
}
