import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personCircleOutline, 
  personOutline, 
  keyOutline, 
  informationCircleOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterLink,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel
  ]
})
export class ProfilePage implements OnInit {

  constructor() {
    addIcons({
      personCircleOutline,
      personOutline,
      keyOutline,
      informationCircleOutline
    });
  }

  ngOnInit() {
  }

}
