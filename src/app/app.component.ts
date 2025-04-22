import { Component, signal, computed, OnInit, inject } from '@angular/core';
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, mergeMap } from 'rxjs/operators';
import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonMenuButton,
  IonButtons,
  IonSearchbar,
  IonAvatar,
  IonButton,
  PopoverController,
  IonFooter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  gridOutline,
  analyticsOutline,
  swapHorizontalOutline,
  cardOutline,
  timeOutline,
  chevronDownOutline,
  notificationsOutline,
  settingsOutline,
  helpCircleOutline,
  mailOutline,
  filterOutline,
  personCircleOutline,
  logOutOutline,
  peopleOutline,
  arrowBackOutline,
  saveOutline,
  cashOutline,
  idCardOutline,
  locationOutline,
  storefrontOutline,
  documentTextOutline,
  searchOutline,
  addOutline,
  refreshOutline,
  ellipsisHorizontal,
  eyeOutline,
  createOutline,
  trashOutline,
  calendarOutline,
  downloadOutline,
  logoGoogle,
} from 'ionicons/icons';
import { ProfileMenuComponent } from './components/profile-menu/profile-menu.component';
import { LogoComponent } from './components/logo/logo.component';
import { AuthService } from './services/auth.service';

// Define the structure for menu items
interface MenuItem {
  title: string;
  url?: string;
  icon?: string;
  badge?: number;
  isHeader?: boolean;
  isSubItem?: boolean; // For potential indentation/styling
  // Add other properties like children for nesting if needed later
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonBadge,
    IonMenuButton,
    IonButtons,
    IonSearchbar,
    IonAvatar,
    IonButton,
    LogoComponent,
    IonFooter,
  ],
})
export class AppComponent implements OnInit {
  // Inject Router and ActivatedRoute
  public router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private popoverCtrl = inject(PopoverController);
  authService = inject(AuthService);

  // Signal for the current page title
  currentPageTitle = signal('Dashboard');

  // Signal for the search input
  searchTerm = signal('');

  // Define the menu structure using the interface
  private allMenuItems: MenuItem[] = [
    { title: 'Menu', isHeader: true },
    { title: 'Dashboard', url: '/dashboard', icon: 'grid-outline' }, // Example route
    { title: 'Borrowers', url: '/borrowers', icon: 'people-outline' }, // Example route
    { title: 'Loans', url: '/loans', icon: 'cash-outline' }, // Example route
    { title: 'Users', url: '/users', icon: 'cash-outline' }, // Example route
    // { title: 'Analytics', url: '/analytics', icon: 'analytics-outline' },
    // { title: 'Transaction', url: '/transaction', icon: 'swap-horizontal-outline' },
    // { title: 'Card', url: '/card', icon: 'card-outline' },
    // { title: 'History', url: '/history', icon: 'time-outline' }, // Simple item for now, nesting can be added
    // { title: 'Notifications', url: '/notifications', icon: 'notifications-outline', badge: 12 },
    // { title: 'Tools', isHeader: true },
    // { title: 'Setting', url: '/settings', icon: 'settings-outline' },
    // { title: 'Help Center', url: '/help', icon: 'help-circle-outline' },
  ];

  // Computed signal to filter menu items based on search term
  filteredMenuItems = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.allMenuItems;
    }
    // Keep headers, filter regular items
    return this.allMenuItems.filter(
      (item) => item.isHeader || item.title.toLowerCase().includes(term)
    );
  });

  constructor() {
    // Register the icons used in the template and potentially the search bar
    addIcons({
      gridOutline,
      analyticsOutline,
      swapHorizontalOutline,
      cardOutline,
      timeOutline,
      chevronDownOutline,
      notificationsOutline,
      settingsOutline,
      helpCircleOutline,
      searchOutline,
      mailOutline,
      filterOutline,
      ellipsisHorizontal,
      personCircleOutline,
      logOutOutline,
      peopleOutline,
      arrowBackOutline,
      saveOutline,
      cashOutline,
      idCardOutline,
      locationOutline,
      storefrontOutline,
      documentTextOutline,
      addOutline,
      refreshOutline,
      eyeOutline,
      createOutline,
      trashOutline,
      calendarOutline,
      downloadOutline,
      logoGoogle,
    });
  }

  ngOnInit() {
    // Subscribe to router events to update title
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        mergeMap((route) => route.data),
        map((data) => data['title'] || '') // Get title from route data or default
      )
      .subscribe((title) => {
        this.currentPageTitle.set(title); // Update the signal
      });
  }

  // Method to update the search term signal
  handleSearchInput(event: any) {
    this.searchTerm.set(event.target.value || '');
  }

  // Placeholder methods for header actions
  openSearch() {
    console.log('Open search...');
    // Implement search overlay or logic here
  }

  openMessages() {
    console.log('Open messages...');
    // Navigate to messages page or show modal
  }

  openNotifications() {
    console.log('Open notifications...');
    // Navigate to notifications page or show popover
  }

  async openProfileMenu(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: ProfileMenuComponent,
      event: ev,
      translucent: true,
      dismissOnSelect: false,
      cssClass: 'profile-popover',
    });
    await popover.present();
  }

  async signOut() {
    await this.authService.signOut();
    // Navigation is handled within authService.signOut
  }
}
