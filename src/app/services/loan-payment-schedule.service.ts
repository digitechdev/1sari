import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface PaymentSchedule {
  id: number;
  loan_id: number;
  period_number: number;
  due_date: string;
  amount_due: number;
  principal_paid: number;
  interest_paid: number;
  outstanding_balance: number;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Open';
  created_at: string;
  borrower_name?: string;
  borrower_id?: number;
  borrower_contact?: string;
}

export interface MissedPayment {
  id: number;
  loanId: number;
  scheduleId: number;
  borrower: {
    id: number;
    name_of_borrower: string;
    contact_no_borrower?: string;
  };
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export interface UpcomingPayment {
  id: number;
  loanId: number;
  scheduleId: number;
  borrower: {
    id: number;
    name_of_borrower: string;
    contact_no_borrower?: string;
  };
  amount: number;
  dueDate: string;
  daysUntilDue: number;
}

export type DueDateFilterType = 'today' | 'this-week' | 'this-month' | 'all';

@Injectable({
  providedIn: 'root'
})
export class LoanPaymentScheduleService {
  private supabaseService = inject(SupabaseService);
  
  private get supabase() {
    return this.supabaseService.supabase;
  }

  /**
   * Get all missed payments (overdue payment schedules)
   * Identifies missed payments as those with status 'Open' and due date less than today
   */
  async getMissedPayments(page: number = 1, limit: number = 10, searchTerm?: string) {
    try {
      // Get today's date for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      // Build the query
      let query = this.supabase
        .from('loan_payment_schedules')
        .select(`
          id,
          loan_id,
          period_number,
          due_date,
          amount_due,
          principal_paid,
          interest_paid,
          outstanding_balance,
          status,
          created_at,
          loans(
            id,
            borrower:account_information!borrower_id(
              id,
              name_of_borrower,
              contact_no_borrower
            )
          )
        `, { count: 'exact' })
        .eq('status', 'Open')
        .lt('due_date', todayStr)
        .order('due_date', { ascending: true });
      
      // Add search filtering if term provided
      if (searchTerm) {
        query = query.or(`loan_id.eq.${searchTerm},loans.account_information.name_of_borrower.ilike.%${searchTerm}%`);
      }
      
      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Execute the query
      const { data, error, count } = await query
        .range(from, to);
      
      if (error) {
        throw error;
      }
      
      // Transform the data to the frontend format
      const missedPayments: MissedPayment[] = (data || []).map((item: any) => {
        // Calculate days overdue
        const dueDate = new Date(item.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const timeDiff = today.getTime() - dueDate.getTime();
        const daysOverdue = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        return {
          id: item.id,
          loanId: item.loan_id,
          scheduleId: item.id,
          borrower: {
            id: item.loans?.borrower?.id || 0,
            name_of_borrower: item.loans?.borrower?.name_of_borrower || 'Unknown',
            contact_no_borrower: item.loans?.borrower?.contact_no_borrower
          },
          amount: item.amount_due,
          dueDate: item.due_date,
          daysOverdue: daysOverdue
        };
      });
      
      return {
        data: missedPayments,
        count: count || 0,
        hasMore: count ? (from + missedPayments.length) < count : false
      };
    } catch (error) {
      console.error('Error fetching missed payments:', error);
      throw error;
    }
  }

  /**
   * Get upcoming payments based on filter
   */
  async getUpcomingPayments(
    filter: DueDateFilterType = 'this-week',
    page: number = 1, 
    limit: number = 10, 
    searchTerm?: string
  ) {
    try {
      // Calculate date ranges based on filter
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      let endDate: string | null = null;
      
      // Set date range based on filter
      switch (filter) {
        case 'today':
          endDate = todayStr;
          break;
        case 'this-week': {
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() + 7);
          endDate = weekEnd.toISOString().split('T')[0];
          break;
        }
        case 'this-month': {
          const monthEnd = new Date(today);
          monthEnd.setDate(today.getDate() + 30);
          endDate = monthEnd.toISOString().split('T')[0];
          break;
        }
        case 'all':
          // No end date for "all"
          break;
      }
      
      // Build the query
      let query = this.supabase
        .from('loan_payment_schedules')
        .select(`
          id,
          loan_id,
          period_number,
          due_date,
          amount_due,
          principal_paid,
          interest_paid,
          outstanding_balance,
          status,
          created_at,
          loans(
            id,
            borrower:account_information!borrower_id(
              id,
              name_of_borrower,
              contact_no_borrower
            )
          )
        `, { count: 'exact' })
        .eq('status', 'Open')
        .gte('due_date', todayStr);
      
      // Add end date filter if specified
      if (endDate) {
        query = query.lte('due_date', endDate);
      }
      
      // Add search filtering if term provided
      if (searchTerm) {
        query = query.or(`loan_id.eq.${searchTerm},loans.account_information.name_of_borrower.ilike.%${searchTerm}%`);
      }
      
      // Apply pagination and ordering
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Execute the query
      const { data, error, count } = await query
        .order('due_date', { ascending: true })
        .range(from, to);
      
      if (error) {
        throw error;
      }
      
      // Transform the data to the frontend format
      const upcomingPayments: UpcomingPayment[] = (data || []).map((item: any) => {
        // Calculate days until due
        const dueDate = new Date(item.due_date);
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysUntilDue = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));
        
        return {
          id: item.id,
          loanId: item.loan_id,
          scheduleId: item.id,
          borrower: {
            id: item.loans?.borrower?.id || 0,
            name_of_borrower: item.loans?.borrower?.name_of_borrower || 'Unknown',
            contact_no_borrower: item.loans?.borrower?.contact_no_borrower
          },
          amount: item.amount_due,
          dueDate: item.due_date,
          daysUntilDue: daysUntilDue
        };
      });
      
      return {
        data: upcomingPayments,
        count: count || 0,
        hasMore: count ? (from + upcomingPayments.length) < count : false
      };
    } catch (error) {
      console.error('Error fetching upcoming payments:', error);
      throw error;
    }
  }

  /**
   * Get a payment schedule by ID
   */
  async getPaymentScheduleById(id: number): Promise<PaymentSchedule | null> {
    try {
      const { data, error } = await this.supabase
        .from('loan_payment_schedules')
        .select(`
          id,
          loan_id,
          period_number,
          due_date,
          amount_due,
          principal_paid,
          interest_paid,
          outstanding_balance,
          status,
          created_at,
          loans(
            id,
            borrower:account_information!borrower_id(
              id,
              name_of_borrower,
              contact_no_borrower
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        return null;
      }
      
      // Cast data to access nested properties safely
      const typedData: any = data;
      
      // Convert to our interface
      const schedule: PaymentSchedule = {
        id: typedData.id,
        loan_id: typedData.loan_id,
        period_number: typedData.period_number,
        due_date: typedData.due_date,
        amount_due: typedData.amount_due,
        principal_paid: typedData.principal_paid,
        interest_paid: typedData.interest_paid,
        outstanding_balance: typedData.outstanding_balance,
        status: typedData.status,
        created_at: typedData.created_at,
        borrower_name: typedData.loans?.borrower?.name_of_borrower || '',
        borrower_id: typedData.loans?.borrower?.id || 0,
        borrower_contact: typedData.loans?.borrower?.contact_no_borrower || ''
      };
      
      return schedule;
    } catch (error) {
      console.error('Error fetching payment schedule by ID:', error);
      throw error;
    }
  }

  /**
   * Update a payment schedule status
   */
  async updatePaymentStatus(id: number, status: 'Pending' | 'Paid' | 'Overdue' | 'Open'): Promise<PaymentSchedule> {
    try {
      const { data, error } = await this.supabase
        .from('loan_payment_schedules')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned after update');
      }
      
      return data as PaymentSchedule;
    } catch (error) {
      console.error('Error updating payment schedule status:', error);
      throw error;
    }
  }

  /**
   * Mark payment schedules as overdue if their due date has passed
   */
  async markOverduePayments(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error, count } = await this.supabase
        .from('loan_payment_schedules')
        .update({ status: 'Overdue' })
        .eq('status', 'Open')
        .lt('due_date', today.toISOString().split('T')[0]);
      
      if (error) {
        throw error;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error marking overdue payments:', error);
      throw error;
    }
  }
}