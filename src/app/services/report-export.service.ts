import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  header: string;
  property: string;
  formatter?: (value: any, row?: any) => string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportExportService {

  constructor() { }

  /**
   * Export data to CSV format
   * 
   * @param data Data to export
   * @param columns Column definitions
   * @param filename Filename without extension
   */
  exportToCSV(data: any[], columns: ExportColumn[], filename: string): void {
    try {
      if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
      }
      
      // Create headers row
      const headers = columns.map(col => col.header);
      
      // Process data rows
      const rows = data.map(item => {
        return columns.map(col => {
          // Get value using property path (handles nested properties)
          const value = this.getPropertyByPath(item, col.property);
          // Format the value if a formatter is provided, passing both value and row data
          return col.formatter ? col.formatter(value, item) : value;
        });
      });
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      rows.forEach(row => {
        // Quote values that contain commas
        const formattedRow = row.map(value => {
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        });
        csvContent += formattedRow.join(',') + '\n';
      });
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('CSV export successful');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }

  /**
   * Export data to PDF format
   * 
   * @param data Data to export
   * @param columns Column definitions
   * @param filename Filename without extension
   * @param title Title to display at the top of the PDF
   * @param orientation Page orientation ('portrait' or 'landscape')
   */
  exportToPDF(
    data: any[], 
    columns: ExportColumn[], 
    filename: string, 
    title: string,
    orientation: 'portrait' | 'landscape' = 'portrait'
  ): void {
    try {
      if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
      }
      
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title and date
      const pageWidth = orientation === 'portrait' ? 210 : 297;
      doc.setFontSize(18);
      doc.text(title, pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      const today = new Date().toLocaleDateString();
      doc.text(`Generated on: ${today}`, pageWidth / 2, 22, { align: 'center' });
      
      // Prepare table headers and data
      const headers = columns.map(col => col.header);
      
      const rows = data.map(item => {
        return columns.map(col => {
          const value = this.getPropertyByPath(item, col.property);
          return col.formatter ? col.formatter(value, item) : value;
        });
      });
      
      // Add the table to the PDF
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 30,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [71, 119, 250],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        margin: { top: 30 }
      });
      
      // Save the PDF
      doc.save(`${filename}.pdf`);
      
      console.log('PDF export successful');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  }

  /**
   * Helper function to get nested property value using dot notation
   * e.g., "borrower.name" will return item.borrower.name
   */
  private getPropertyByPath(obj: any, path: string): any {
    try {
      return path.split('.').reduce((o, p) => (o && o[p] !== undefined) ? o[p] : null, obj);
    } catch (error) {
      console.error(`Error accessing property path ${path}:`, error);
      return null;
    }
  }
} 