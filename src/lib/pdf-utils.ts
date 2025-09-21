import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PDFHeaderOptions {
  title: string;
  subtitle?: string;
  showDate?: boolean;
  logoPath?: string;
  companyName?: string;
}

export interface PDFTableColumn {
  header: string;
  dataKey: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export class PDFGenerator {
  private doc: jsPDF;
  private currentY: number = 0;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.currentY = 0;
  }

  /**
   * Add a professional header with logo and company branding
   */
  addHeader(options: PDFHeaderOptions): void {
    const {
      title,
      subtitle,
      showDate = true,
      logoPath = '/sc_logo.png', // Use the better logo
      companyName = 'Samarth Caterers'
    } = options;

    // 1️⃣ Background first
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(10, 8, 190, 40, 'F');

    // 2️⃣ Logo (try sc_logo.png first, fallback to logo.png)
    try {
      this.doc.addImage(logoPath, 'PNG', 10, 8, 35, 25);
    } catch (error) {
      this.doc.addImage('/logo.png', 'PNG', 10, 8, 35, 25);
    }

    // 3️⃣ Company name
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(22);
    this.doc.setTextColor(34, 153, 84); // Green
    this.doc.text(companyName, 50, 20);

    // 4️⃣ Title
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, 50, 30);

    // 5️⃣ Subtitle
    if (subtitle) {
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(12);
      this.doc.setTextColor(80, 80, 80);
      this.doc.text(subtitle, 50, 36);
    }

    // 6️⃣ Date
    if (showDate) {
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      this.doc.setTextColor(120, 120, 120);
      this.doc.text(
          `Generated on: ${new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`,
          50,
          42
      );
    }

    // 7️⃣ Decorative line (on top)
    this.doc.setDrawColor(34, 153, 84);
    this.doc.setLineWidth(1);
    this.doc.line(10, 48, 200, 48);

    this.currentY = 55;
  }


  /**
   * Add a section header with consistent styling
   */
  addSectionHeader(title: string, level: 1 | 2 = 1): void {
    // Check if we need a new page before adding section header
    this.addPageIfNeeded(15);
    
    this.currentY += level === 1 ? 10 : 5;
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(level === 1 ? 14 : 12);
    this.doc.setTextColor(34, 153, 84);
    this.doc.text(title, 10, this.currentY);
    
    // Add underline
    this.doc.setDrawColor(34, 153, 84);
    this.doc.setLineWidth(0.5);
    this.doc.line(10, this.currentY + 1, 50, this.currentY + 1);
    
    this.currentY += 8;
  }

  /**
   * Add text content with proper formatting
   */
  addText(text: string, options?: {
    fontSize?: number;
    color?: [number, number, number];
    bold?: boolean;
    indent?: number;
    maxWidth?: number;
  }): void {
    const {
      fontSize = 11,
      color = [0, 0, 0],
      bold = false,
      indent = 0,
      maxWidth = 180
    } = options || {};

    this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(color[0], color[1], color[2]);

    const lines = this.doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      // Check if we need a new page before adding each line
      this.addPageIfNeeded(8);
      this.doc.text(line, 10 + indent, this.currentY);
      this.currentY += 6;
    });
  }

  /**
   * Add a data table with professional styling
   */
  addTable(data: any[], columns: PDFTableColumn[], options?: {
    title?: string;
    startY?: number;
  }): void {
    const { title, startY = this.currentY } = options || {};

    if (title) {
      this.addSectionHeader(title, 2);
    }

    // Check if we need a new page before adding table
    this.addPageIfNeeded(30);

    const tableData = data.map(row => 
      columns.map(col => {
        const value = row[col.dataKey];
        if (typeof value === 'number') {
          return value.toLocaleString('en-IN');
        }
        return value?.toString() || '—';
      })
    );

    autoTable(this.doc, {
      startY: this.currentY,
      head: [columns.map(col => col.header)],
      body: tableData,
      headStyles: {
        fillColor: [34, 153, 84],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 6
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: columns.reduce((acc, col, index) => {
        if (col.width) acc[index] = { cellWidth: col.width };
        if (col.align) acc[index] = { halign: col.align };
        return acc;
      }, {} as any),
      margin: { left: 10, right: 10 },
      tableWidth: 'auto',
      didDrawPage: (data) => {
        // Add footer to each page as it's drawn
        this.addFooterToPage(data.pageNumber);
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Add a summary box with key metrics
   */
  addSummaryBox(items: Array<{ label: string; value: string | number; color?: [number, number, number] }>): void {
    // Check if we need a new page before adding summary box
    this.addPageIfNeeded(items.length * 8 + 25);
    
    this.currentY += 5;
    
    // Background box
    this.doc.setFillColor(248, 250, 252);
    this.doc.setDrawColor(34, 153, 84);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(10, this.currentY, 190, items.length * 8 + 10, 3, 3, 'FD');
    
    // Title
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(34, 153, 84);
    this.doc.text('Summary', 15, this.currentY + 7);
    
    // Items
    items.forEach((item, index) => {
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(`${item.label}:`, 15, this.currentY + 15 + (index * 8));
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(item.color?.[0] || 34, item.color?.[1] || 153, item.color?.[2] || 84);
      this.doc.text(item.value.toString(), 60, this.currentY + 15 + (index * 8));
    });
    
    this.currentY += items.length * 8 + 15;
  }

  /**
   * Add a professional footer to a specific page
   */
  addFooterToPage(pageNumber: number): void {
    const pageHeight = this.doc.internal.pageSize.height;
    
    // Footer line
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.line(10, pageHeight - 20, 200, pageHeight - 20);
    
    // Footer text
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(120, 120, 120);
    this.doc.text('Thank you for choosing Samarth Caterers!', 10, pageHeight - 15);
    this.doc.text('© 2025 Samarth Caterers - All Rights Reserved', 10, pageHeight - 10);
    
    // Page number
    this.doc.text(`Page ${pageNumber}`, 180, pageHeight - 10);
  }

  /**
   * Add a professional footer to the current page
   */
  addFooter(): void {
    const pageNumber = this.doc.getCurrentPageInfo().pageNumber;
    this.addFooterToPage(pageNumber);
  }

  /**
   * Save the PDF with a given filename
   */
  save(filename: string): void {
    // Add footer to all pages
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.addFooterToPage(i);
    }
    
    this.doc.save(filename);
  }

  /**
   * Get the current Y position
   */
  getCurrentY(): number {
    return this.currentY;
  }

  /**
   * Set the current Y position
   */
  setCurrentY(y: number): void {
    this.currentY = y;
  }

  /**
   * Check if we need a new page
   */
  checkPageBreak(requiredSpace: number = 20): boolean {
    const pageHeight = this.doc.internal.pageSize.height;
    const footerSpace = 30; // Space reserved for footer
    return this.currentY + requiredSpace > pageHeight - footerSpace;
  }

  /**
   * Add a new page if needed
   */
  addPageIfNeeded(requiredSpace: number = 20): void {
    if (this.checkPageBreak(requiredSpace)) {
      // Add footer to current page before adding new page
      this.addFooter();
      this.doc.addPage();
      this.currentY = 20;
    }
  }
}

/**
 * Utility function to format currency
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('en-IN')}`;
};

/**
 * Utility function to format date
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Utility function to format datetime
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
