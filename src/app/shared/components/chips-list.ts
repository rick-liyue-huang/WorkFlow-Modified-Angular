import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  forwardRef,
  Input,
  ViewChild
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { UserService } from '../../services';
import { User } from '../../domain';
import {
  startWith,
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap
} from 'rxjs/operators';

@Component({
  selector: 'app-chips-list',
  template: `
    <div [formGroup]="chips" class="full-width">
      <span>{{ label }}</span>
      <mat-chip-list>
        <mat-chip color="primary" selected="true" *ngFor="let member of items">
          {{ member.name }} >>
          <span (click)="removeMember(member)" class="remove-tag">> Click to update</span>
        </mat-chip>
      </mat-chip-list>
      <mat-form-field *ngIf="displayInput" class="full-width">
        <input
          matInput
          [placeholder]="placeholderText"
          [matAutocomplete]="autoMember"
          formControlName="memberSearch"
        />
      </mat-form-field>
    </div>
    <mat-autocomplete #autoMember="matAutocomplete" [displayWith]="displayUser">
      <mat-option
        *ngFor="let item of memberResults$ | async"
        [value]="item"
        (onSelectionChange)="handleMemberSelection(item)"
      >
        {{ item.name }}
      </mat-option>
    </mat-autocomplete>
  `,
  styles: [``],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChipsListComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ChipsListComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsListComponent implements ControlValueAccessor, OnInit {
  // fix the lint complaints about using a reference in template
  // It seems tslint requires now that a `@ViewChild` need to be declared
  // 'you are using blablabla that you're trying to access does not exist in the class declaration.'
  @ViewChild('autoMember', { static: true }) autoMember: MatAutocomplete;
  @Input() multiple = true;
  @Input() label = 'add/edit members';
  @Input() placeholderText = 'input email';
  items: User[];
  chips: FormGroup;
  memberResults$: Observable<User[]>;

  constructor(private fb: FormBuilder, private service: UserService) {
    this.items = [];
  }

  ngOnInit() {
    this.chips = this.fb.group({
      memberSearch: ['']
    });
    this.memberResults$ = this.searchUsers(
      this.chips.controls['memberSearch'].valueChanges
    );
  }

  // ????????????????????????????????????????????????????????? registerOnChange ???
  // ????????????????????????????????????????????????????????????
  // ???????????? EventEmitter ??????????????????????????????????????????
  private propagateChange = (_: any) => {};

  // ???????????????
  public writeValue(obj: User[]) {
    if (obj && this.multiple) {
      const userEntities: { [id: string]: User } = obj.reduce(
        (entities, user) => {
          return { ...entities, [<string>user.id]: user };
        },
        {}
      );
      if (this.items) {
        const remaining = this.items.filter(
          item => !userEntities[<string>item.id]
        );
        this.items = [...remaining, ...obj];
      }
    } else if (obj && !this.multiple) {
      this.items = [...obj];
    }
  }

  // ???????????????????????????????????? fn ????????????
  // ???????????????????????? emit ??????????????????
  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  // ??????????????????????????????????????? null ????????????????????????????????????
  public validate(c: FormControl) {
    return this.items
      ? null
      : {
          chipListInvalid: {
            valid: false
          }
        };
  }

  // ????????????????????????????????? touched ??????
  public registerOnTouched() {}

  removeMember(member: User) {
    const ids = this.items.map(u => u.id);
    const i = ids.indexOf(member.id);
    if (this.multiple) {
      this.items = [...this.items.slice(0, i), ...this.items.slice(i + 1)];
    } else {
      this.items = [];
    }
    this.chips.patchValue({ memberSearch: '' });
    this.propagateChange(this.items);
  }

  handleMemberSelection(user: User) {
    if (this.items.map(u => u.id).indexOf(user.id) !== -1) {
      return;
    }
    if (this.multiple) {
      this.items = [...this.items, user];
    } else {
      this.items = [user];
    }
    this.chips.patchValue({ memberSearch: user.name });
    this.propagateChange(this.items);
  }

  displayUser(user: User): string {
    return user ? <string>user.name : '';
  }

  searchUsers(obs: Observable<string>): Observable<User[]> {
    return obs.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      filter((s: string) => (s !== null || s !== undefined) && s.length > 1),
      switchMap(str => this.service.searchUsers(str))
    );
  }

  get displayInput() {
    return this.multiple || this.items.length === 0;
  }
}
