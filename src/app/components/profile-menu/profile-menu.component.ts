import { Component } from '@angular/core';
import { IonList, IonItem, IonIcon, IonLabel, PopoverController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline, logOutOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss'],
  standalone: true,
  imports: [IonList, IonItem, IonIcon, IonLabel]
})
export class ProfileMenuComponent {

  constructor(
    private popoverCtrl: PopoverController,
    private router: Router
  ) {
    addIcons({ personCircleOutline, logOutOutline });
  }

  goToProfile() {
    this.popoverCtrl.dismiss();
    this.router.navigate(['/profile']);
  }

  logout() {
    console.log('Logout action');
    this.popoverCtrl.dismiss();
  }
}
