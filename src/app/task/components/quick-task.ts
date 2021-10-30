import { Component, Output, EventEmitter, HostListener, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-quick-task',
  template: `
    <mat-form-field class="full-width" [matTooltip]="'Press to confirm'">
      <input matInput placeholder="quickly create one task" [(ngModel)]="desc"/>
      <button mat-icon-button matSuffix (click)="sendQuickTask()">
        <mat-icon>send</mat-icon>
      </button>
    </mat-form-field>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickTaskComponent {

  desc: string;
  @Output() quickTask = new EventEmitter<string>();

  constructor() { }

  @HostListener('keyup.enter')
  sendQuickTask() {
    if (!this.desc || this.desc.length === 0 || !this.desc.trim() || this.desc.length > 20) {
      return;
    }
    this.quickTask.emit(this.desc);
    this.desc = '';
  }
}
