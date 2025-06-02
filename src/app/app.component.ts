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
  homeOutline,
  peopleOutline,
  cashOutline,
  cardOutline,
  calendarOutline,
  analyticsOutline,
  settingsOutline,
  personCircleOutline,
  documentTextOutline,
  addOutline,
  checkmarkCircleOutline,
  timeOutline,
  closeCircleOutline,
  checkmarkDoneOutline,
  alertCircleOutline,
  calculatorOutline,
  notificationsOutline,
  downloadOutline,
  personAddOutline,
  keyOutline,
  listOutline,
  trendingUpOutline,
  warningOutline,
  personOutline,
  logOutOutline,
  mailOutline,
  chevronDownOutline,
  chevronUpOutline,
  searchOutline
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
  isSubItem?: boolean;
  expanded?: boolean;  // For tracking accordion expansion state
  parentId?: string;   // For identifying parent-child relationships
  id?: string;         // Unique identifier for each item
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
    { id: 'dashboard', title: 'Dashboard', url: '/dashboard', icon: 'home-outline' },
    
    // Borrowers section
    { id: 'borrowers', title: 'Borrowers', url: '/borrowers', icon: 'people-outline', expanded: false },
    { id: 'borrowers-all', title: 'All Borrowers', url: '/borrowers', icon: 'people-outline', isSubItem: true, parentId: 'borrowers' },
    { id: 'borrowers-new', title: 'Add New Borrower', url: '/borrowers/new', icon: 'add-outline', isSubItem: true, parentId: 'borrowers' },
    
    // Loans section
    { id: 'loans', title: 'Loans', url: '/loans', icon: 'cash-outline', expanded: false },
    { id: 'loans-all', title: 'All Loans', url: '/loans', icon: 'document-text-outline', isSubItem: true, parentId: 'loans' },
    { id: 'loans-create', title: 'Create Loan', url: '/loans/new', icon: 'add-outline', isSubItem: true, parentId: 'loans' },
    
    // Payments section
    { id: 'payments', title: 'Payments', url: '/payments', icon: 'card-outline', expanded: false },
    { id: 'payments-record', title: 'Record Payment', url: '/payments/new', icon: 'add-outline', isSubItem: true, parentId: 'payments' },
    { id: 'payments-history', title: 'Payment History', url: '/payments/history', icon: 'time-outline', isSubItem: true, parentId: 'payments' },
    { id: 'payments-missed', title: 'Missed Payments', url: '/payments/missed', icon: 'alert-circle-outline', isSubItem: true, parentId: 'payments' },
    { id: 'payments-upcoming', title: 'Upcoming Dues', url: '/payments/upcoming', icon: 'calendar-outline', isSubItem: true, parentId: 'payments' },
    
    // Schedules section
    { id: 'schedules', title: 'Schedules', url: '/schedules', icon: 'calendar-outline', expanded: false },
    { id: 'schedules-amortization', title: 'Amortization Tables', url: '/schedules/amortization', icon: 'calculator-outline', isSubItem: true, parentId: 'schedules' },
    { id: 'schedules-calendar', title: 'Payment Calendar', url: '/schedules/calendar', icon: 'calendar-outline', isSubItem: true, parentId: 'schedules' },
    { id: 'schedules-reminders', title: 'Due Reminders', url: '/schedules/reminders', icon: 'notifications-outline', isSubItem: true, parentId: 'schedules' },
    
    // Reports section
    { id: 'reports', title: 'Reports', url: '/reports', icon: 'analytics-outline', expanded: false },
    { id: 'reports-disbursement', title: 'Loan Disbursement Report', url: '/reports/disbursement', icon: 'cash-outline', isSubItem: true, parentId: 'reports' },
    { id: 'reports-collection', title: 'Collection Report', url: '/reports/collection', icon: 'cash-outline', isSubItem: true, parentId: 'reports' },
    { id: 'reports-overdue', title: 'Overdue Loans', url: '/reports/overdue', icon: 'alert-circle-outline', isSubItem: true, parentId: 'reports' },
    { id: 'reports-performance', title: 'Performance by Officer', url: '/reports/performance', icon: 'trending-up-outline', isSubItem: true, parentId: 'reports' },
    { id: 'reports-export', title: 'Export CSV/PDF', url: '/reports/export', icon: 'download-outline', isSubItem: true, parentId: 'reports' },
    
    // Users & Roles section
    { id: 'users', title: 'Users & Roles', url: '/users', icon: 'people-outline', expanded: false },
    { id: 'users-all', title: 'All Users', url: '/users', icon: 'people-outline', isSubItem: true, parentId: 'users' },
    { id: 'users-new', title: 'Add New User', url: '/users/new', icon: 'person-add-outline', isSubItem: true, parentId: 'users' },
    { id: 'users-roles', title: 'Roles & Permissions', url: '/users/roles', icon: 'key-outline', isSubItem: true, parentId: 'users' },
    { id: 'users-logs', title: 'Activity Logs', url: '/users/logs', icon: 'list-outline', isSubItem: true, parentId: 'users' },
    
    // Settings section
    { id: 'settings', title: 'Settings', url: '/settings', icon: 'settings-outline', expanded: false },
    { id: 'settings-products', title: 'Loan Products & Terms', url: '/settings/loan-products', icon: 'document-text-outline', isSubItem: true, parentId: 'settings' },
    { id: 'settings-interest', title: 'Interest Settings', url: '/settings/interest', icon: 'trending-up-outline', isSubItem: true, parentId: 'settings' },
    { id: 'settings-penalties', title: 'Penalties & Grace Periods', url: '/settings/penalties', icon: 'warning-outline', isSubItem: true, parentId: 'settings' },
    { id: 'settings-notifications', title: 'Notification Preferences', url: '/settings/notifications', icon: 'notifications-outline', isSubItem: true, parentId: 'settings' },
    
    // My Account section
    { id: 'account', title: 'My Account', url: '/account', icon: 'person-circle-outline', expanded: false },
    { id: 'account-profile', title: 'Profile', url: '/account/profile', icon: 'person-outline', isSubItem: true, parentId: 'account' },
    { id: 'account-password', title: 'Change Password', url: '/account/password', icon: 'key-outline', isSubItem: true, parentId: 'account' },
    { id: 'account-logout', title: 'Logout', url: '/logout', icon: 'log-out-outline', isSubItem: true, parentId: 'account' },
  ];

  // Computed signal to filter menu items based on search term
  filteredMenuItems = computed(() => {
    const term = this.searchTerm().toLowerCase();
    // First filter by user role
    let roleFilteredItems = this.filterMenuItemsByUserRole(this.allMenuItems);
    
    // Then filter by search term if one exists
    if (term) {
      // For search, we want to show both parents and matching children
      const matchingItems = roleFilteredItems.filter(
        (item) => item.isHeader || item.title.toLowerCase().includes(term)
      );
      
      // Ensure we also include parent items of matching sub-items
      const matchingParentIds = new Set(
        matchingItems
          .filter(item => item.isSubItem && item.parentId)
          .map(item => item.parentId)
      );
      
      // Include matching items and their parents
      roleFilteredItems = roleFilteredItems.filter(item => 
        item.isHeader || 
        matchingItems.includes(item) || 
        (item.id && matchingParentIds.has(item.id))
      );
      
      // Expand parents of matching items
      roleFilteredItems
        .filter(item => item.id && matchingParentIds.has(item.id))
        .forEach(item => {
          const originalItem = this.allMenuItems.find(mi => mi.id === item.id);
          if (originalItem) {
            originalItem.expanded = true;
          }
        });
    }
    
    return roleFilteredItems;
  });

  constructor() {
    // Register the icons used in the template and potentially the search bar
    addIcons({
      homeOutline,
      peopleOutline,
      cashOutline,
      cardOutline,
      calendarOutline,
      analyticsOutline,
      settingsOutline,
      personCircleOutline,
      documentTextOutline,
      addOutline,
      checkmarkCircleOutline,
      timeOutline,
      closeCircleOutline,
      checkmarkDoneOutline,
      alertCircleOutline,
      calculatorOutline,
      notificationsOutline,
      downloadOutline,
      personAddOutline,
      keyOutline,
      listOutline,
      trendingUpOutline,
      warningOutline,
      personOutline,
      logOutOutline,
      mailOutline,
      chevronDownOutline,
      chevronUpOutline,
      searchOutline
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

  // Method to toggle the expanded state of a parent menu item
  toggleMenuExpand(item: MenuItem, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Find the original item
    const originalItem = this.allMenuItems.find(mi => mi.id === item.id);
    const wasExpanded = originalItem?.expanded;
    
    // Close all expanded items first (accordion behavior)
    this.allMenuItems.forEach(menuItem => {
      if (!menuItem.isSubItem && menuItem.id !== item.id) {
        menuItem.expanded = false;
      }
    });
    
    // Toggle the current item
    if (originalItem) {
      originalItem.expanded = !wasExpanded;
    }
  }

  // Method to check if a menu item has children
  hasChildren(item: MenuItem): boolean {
    return this.allMenuItems.some(menuItem => 
      menuItem.isSubItem === true && menuItem.parentId === item.id
    );
  }

  // Method to check if a menu item's children should be visible
  shouldShowChildren(item: MenuItem): boolean {
    const originalItem = this.allMenuItems.find(mi => mi.id === item.id);
    return originalItem ? originalItem.expanded === true : false;
  }

  // Method to get children of a menu item
  getChildren(item: MenuItem): MenuItem[] {
    return this.allMenuItems.filter(menuItem => 
      menuItem.isSubItem === true && menuItem.parentId === item.id
    );
  }

  // Filter menu items based on user role
  private filterMenuItemsByUserRole(items: MenuItem[]): MenuItem[] {
    // For this demo, we'll return all items
    return items;
  }
}
