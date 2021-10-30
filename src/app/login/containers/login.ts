import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Store, select} from '@ngrx/store';
import {Observable} from 'rxjs';
import {Quote} from '../../domain';
import * as fromRoot from '../../reducers';
import * as authActions from '../../actions/auth.action';
import * as actions from '../../actions/quote.action';

@Component({
  selector: 'app-login',
  template: `
  <form fxLayout="row" fxLayout.xs="column" fxLayoutAlign="center" [formGroup]="form" (ngSubmit)="onSubmit(form, $event)">
    <mat-card fxFlex="0 1 20rem">
      <mat-card-header>
        <mat-card-title> Login</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field class="full-width">
          <input matInput type="text" placeholder="Your Email" formControlName="email">
          <mat-error>need input info</mat-error>
        </mat-form-field>
        <mat-form-field class="full-width">
          <input matInput type="password" placeholder="Your Password" formControlName="password">
          <mat-error>wrong password</mat-error>
        </mat-form-field>
        <button mat-raised-button type="submit" [disabled]="!form.valid">Login</button>
      </mat-card-content>
      <mat-card-actions class="text-right">
        <p>Haven't an account？ <a routerLink="/register">Register</a></p>
        <p>Forget <a routerLink="/forgot">Password?</a></p>
      </mat-card-actions>
    </mat-card>
    <mat-card fxFlex="0 1 20rem">
      <mat-card-header>
        <mat-card-title> Something to know..</mat-card-title>
        <mat-card-subtitle>
          {{ (quote$ | async)?.en }}
        </mat-card-subtitle>
      </mat-card-header>
      <img matCardImage [src]="(quote$ | async)?.pic">
      <mat-card-content>
        <p> {{ (quote$ | async)?.cn }}</p>
      </mat-card-content>
    </mat-card>
  </form>
  `,
  styles: [`
  .text-right {
    margin: 10px;
    text-align: end;
  }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  quote$: Observable<Quote>;

  constructor(private fb: FormBuilder,
              private store$: Store<fromRoot.State>) {
    this.quote$ = this.store$.pipe(select(fromRoot.getQuoteState));
  }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.required]
    });
    this.store$.dispatch({type: actions.QUOTE});
  }

  onSubmit({value, valid}: FormGroup, e: Event) {
    e.preventDefault();
    if (!valid) {
      return;
    }
    this.store$.dispatch(
      new authActions.LoginAction(value));
  }
}
