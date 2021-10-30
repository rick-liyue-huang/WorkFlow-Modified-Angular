import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { User } from '../../domain';

@Component({
  selector: 'app-invite',
  template: `
    <h2 matDialogTitle>{{ dialogTitle }}</h2>
    <form class="full-width" #f="ngForm" (ngSubmit)="onSubmit($event, f)">
      <app-chips-list [label]="'Invite members'" name="members" [(ngModel)]="members">
      </app-chips-list>
      <div mat-dialog-actions>
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="!f.valid"
        >
          Save
        </button>
        <button matDialogClose mat-raised-button type="button">Close</button>
      </div>
    </form>
  `,
  styles: [``]
})
export class InviteComponent implements OnInit {
  members: User[] = [];
  dialogTitle: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<InviteComponent>
  ) {}

  ngOnInit() {
    this.members = [...this.data.members];
    this.dialogTitle = this.data.dialogTitle
      ? this.data.dialogTitle
      : 'Invite Members';
  }

  onSubmit(ev: Event, { value, valid }: NgForm) {
    ev.preventDefault();
    if (!valid) {
      return;
    }
    this.dialogRef.close(this.members);
  }
}
