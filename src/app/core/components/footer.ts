import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <mat-toolbar color="accent">
      <span class="fill-remaining-space"></span>
      <span>&copy;RichCoding</span>
      <span class="fill-remaining-space"></span>
    </mat-toolbar>
  `,
  styles: [`
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}
