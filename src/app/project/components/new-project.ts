import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-new-project',
  template: `
    <form
      fxLayout="column"
      class="form"
      [formGroup]="form"
      (ngSubmit)="onSubmit(form, $event)"
    >
      <h3 matDialogTitle>{{ dialogTitle }}</h3>
      <div matDialogContent>
        <mat-form-field class="full-width">
          <input matInput placeholder="Project Name" formControlName="name" />
        </mat-form-field>
        <mat-form-field class="full-width">
          <input
            matInput
            placeholder="Project Description"
            formControlName="desc"
          />
        </mat-form-field>
        <app-image-list-select
          [cols]="6"
          [items]="thumbnails$ | async"
          formControlName="coverImg"
        >
        </app-image-list-select>
      </div>
      <div matDialogActions>
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="!form.valid"
        >
          Save
        </button>
        <button matDialogClose mat-raised-button type="button">Close</button>
      </div>
    </form>
  `,
  styles: [
    `
      .form {
        margin: 0;
        padding: 0;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewProjectComponent implements OnInit {
  form: FormGroup;
  dialogTitle: string;
  thumbnails$: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<NewProjectComponent>
  ) {
    this.thumbnails$ = this.data.thumbnails;
  }

  ngOnInit() {
    if (this.data.project) {
      this.form = this.fb.group({
        name: [
          this.data.project.name,
          Validators.compose([Validators.required, Validators.maxLength(20)])
        ],
        desc: [this.data.project.desc, Validators.maxLength(40)],
        coverImg: [this.data.project.coverImg, Validators.required]
      });
      this.dialogTitle = 'Edit Project';
    } else {
      this.form = this.fb.group({
        name: [
          '',
          Validators.compose([Validators.required, Validators.maxLength(20)])
        ],
        desc: ['', Validators.maxLength(40)],
        coverImg: [this.data.img, Validators.required]
      });
      this.dialogTitle = 'Create Project';
    }
  }

  onSubmit({ value, valid }: FormGroup, event: Event) {
    event.preventDefault();
    if (!valid) {
      return;
    }
    this.dialogRef.close({
      name: value.name,
      desc: value.desc ? value.desc : null,
      coverImg: value.coverImg
    });
  }
}
