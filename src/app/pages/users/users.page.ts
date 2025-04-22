import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, WritableSignal, viewChild, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { NgxDatatableModule, ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../interfaces/user-profile.interface';
import { UserFormComponent } from '../../components/user-form/user-form.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, NgxDatatableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPage implements OnInit {
  private userService = inject(UserService);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);

  // Signals for state management
  users: WritableSignal<UserProfile[]> = signal([]);
  isLoading = signal<boolean>(false);
  errorLoading = signal<string | null>(null);
  searchTerm = signal<string>('');

  // Access the datatable instance and the template
  @ViewChild(DatatableComponent) table!: DatatableComponent;
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

  tableColumns: any[] = [];
  readonly ColumnMode = ColumnMode;

  // Computed signal for filtering
  displayableUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.users();
    }
    return this.users().filter(user =>
      user.full_name?.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.setupTableColumns();
    this.loadUsers();
  }

  setupTableColumns() {
    this.tableColumns = [
      { prop: 'email', name: 'Email', flexGrow: 3 },
      { prop: 'full_name', name: 'Full Name', flexGrow: 2 },
      { prop: 'role', name: 'Role', flexGrow: 1 },
      {
        name: 'Actions',
        prop: 'id',
        sortable: false,
        draggable: false,
        resizable: false,
        width: 120,
        cellTemplate: this.actionsTemplate,
      },
    ];
  }

  async loadUsers(refresh = false) {
    this.isLoading.set(true);
    this.errorLoading.set(null);
    if (refresh) {
        // Optional: Add logic for pull-to-refresh or cache busting if needed
    }

    try {
      const fetchedUsers = await this.userService.getUsers();
      this.users.set(fetchedUsers);
    } catch (err: any) {
      const message = err.message || 'Failed to load users.';
      console.error('Error loading users:', err);
      this.errorLoading.set(message);
      this.showToast(message, 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  async refreshData () {
    this.searchTerm.set(''); // Clear search on refresh
    this.loadUsers(true);
    const toast = await this.toastCtrl.create({
      message: 'Data refreshed.',
      duration: 1500,
      position: 'bottom',
      color: 'medium',
    });
    await toast.present();
  }

  handleSearch(event: any) {
    const term = event.target.value || '';
    this.searchTerm.set(term);
  }

  async addUser() {
    this.router.navigate(['/users/new']);
  }

  async editUser(user: UserProfile) {
    if (user.id) {
        this.router.navigate(['/users/edit', user.id]);
    } else {
        console.error('Cannot edit user without an ID');
        this.showToast('Cannot edit user: missing ID.', 'danger');
    }
  }

  // No deleteUser method here - should be handled securely via backend/functions

  async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
} 