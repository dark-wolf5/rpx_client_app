import {Component, Inject} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NgIf} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {AppLauncher} from '@capacitor/app-launcher';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    NgIf,
    IonicModule,
  ],
})
export class AlertDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      alertTitle: string;
      alertText: string;
      alertLink: string;
      alertLinkText: string;
    }
  ) {}

  continueWithAction() {
    this.dialogRef.close({continueWithAction: true});
  }
  cancelAction() {
    this.dialogRef.close({continueWithAction: false});
  }

  openExternal(href: string) {
    AppLauncher.openUrl({url: href});
  }
}
