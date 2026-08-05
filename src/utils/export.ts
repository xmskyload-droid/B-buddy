import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Expense, Category } from '../types';
import { formatDate, formatCurrency } from './formatters';
import { startOfMonth, endOfMonth, isWithinInterval, format } from 'date-fns';

export const exportToCSV = async (
  expenses: Expense[],
  categories: Category[],
  currency: string = '₹',
  monthDate?: Date
) => {
  try {
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    // Filter by month if provided
    let targetExpenses = expenses;
    if (monthDate) {
      const mStart = startOfMonth(monthDate);
      const mEnd = endOfMonth(monthDate);
      targetExpenses = expenses.filter(e => isWithinInterval(new Date(e.date), { start: mStart, end: mEnd }));
    }

    const headers = ['Date', 'Category', 'Amount', 'Payment Method', 'Notes', 'Type', 'Currency'];

    const rows = targetExpenses.map(e => {
      const catName = categoryMap.get(e.categoryId) || 'Other';
      const cleanNotes = (e.notes || '').replace(/"/g, '""');
      return [
        `"${formatDate(e.date)}"`,
        `"${catName}"`,
        e.amount,
        `"${e.paymentMethod || 'Cash'}"`,
        `"${cleanNotes}"`,
        '"Expense"',
        `"${currency}"`,
      ].join(',');
    });

    const monthLabel = monthDate ? format(monthDate, 'MMMM_yyyy') : 'All_Time';
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Ensure cacheDirectory or documentDirectory has trailing slash
    let baseDir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || '';
    if (baseDir && !baseDir.endsWith('/')) {
      baseDir += '/';
    }

    const fileUri = `${baseDir}Spendy_Expenses_${monthLabel}_${Date.now()}.csv`;

    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: `Export Expenses (${monthLabel}) CSV`,
        UTI: 'public.comma-separated-values-text',
      });
    }

    return true;
  } catch (error) {
    console.error('CSV Export Error:', error);
    throw error;
  }
};

export const exportToPDF = async (
  expenses: Expense[],
  categories: Category[],
  totalThisMonth: number,
  currency: string = '₹',
  monthDate?: Date
) => {
  try {
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    // Filter by month if provided
    let targetExpenses = expenses;
    let reportTitle = 'Personal Expense Report';
    let monthHeaderLabel = format(new Date(), 'MMMM yyyy');

    if (monthDate) {
      const mStart = startOfMonth(monthDate);
      const mEnd = endOfMonth(monthDate);
      targetExpenses = expenses.filter(e => isWithinInterval(new Date(e.date), { start: mStart, end: mEnd }));
      monthHeaderLabel = format(monthDate, 'MMMM yyyy');
      reportTitle = `Monthly Expense Report — ${monthHeaderLabel}`;
    }

    const reportTotal = targetExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Group expenses by category for summary table
    const catTotals: Record<string, number> = {};
    targetExpenses.forEach(e => {
      catTotals[e.categoryId] = (catTotals[e.categoryId] || 0) + e.amount;
    });

    const categoryRows = Object.entries(catTotals)
      .map(([catId, amt]) => {
        const cat = categoryMap.get(catId);
        const name = cat?.name || 'Other';
        const pct = reportTotal > 0 ? ((amt / reportTotal) * 100).toFixed(1) : '0';
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700;">${formatCurrency(amt, currency)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #22c55e; font-weight: 600;">${pct}%</td>
          </tr>
        `;
      })
      .join('');

    const transactionRows = targetExpenses
      .slice(0, 150) // Top 150
      .map(e => {
        const cat = categoryMap.get(e.categoryId);
        const name = cat?.name || 'Other';
        return `
          <tr>
            <td style="padding: 8px 10px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">${formatDate(e.date)}</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #f3f4f6; font-weight: 600;">${name}</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">${e.paymentMethod || 'Cash'}</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #f3f4f6; color: #6b7280;">${e.notes || '-'}</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 700; color: #ef4444;">-${formatCurrency(e.amount, currency)}</td>
          </tr>
        `;
      })
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #111827; background: #ffffff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #22c55e; padding-bottom: 16px; margin-bottom: 24px; }
            .logo { font-size: 28px; font-weight: 800; color: #22c55e; }
            .subtitle { font-size: 14px; color: #6b7280; font-weight: 600; }
            .summary-card { background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
            .summary-title { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
            .summary-value { font-size: 32px; font-weight: 800; color: #111827; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
            th { text-align: left; padding: 10px; background: #f3f4f6; color: #374151; font-weight: 700; border-bottom: 1px solid #e5e7eb; }
            .section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #111827; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Spendy 💰</div>
              <div class="subtitle">${reportTitle}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; color: #6b7280;">Report Period</div>
              <div style="font-weight: 700; font-size: 14px; color: #22c55e;">${monthHeaderLabel}</div>
            </div>
          </div>

          <div class="summary-card">
            <div>
              <div class="summary-title">Total Spent in ${monthHeaderLabel}</div>
              <div class="summary-value">${formatCurrency(reportTotal, currency)}</div>
            </div>
            <div style="text-align: right;">
              <div class="summary-title">Transactions</div>
              <div class="summary-value" style="font-size: 24px; color: #4b5563;">${targetExpenses.length}</div>
            </div>
          </div>

          <div class="section-title">Category Breakdown</div>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th style="text-align: right;">Amount</th>
                <th style="text-align: right;">Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${categoryRows || '<tr><td colspan="3" style="padding: 12px; text-align: center; color: #9ca3af;">No category data available for this month</td></tr>'}
            </tbody>
          </table>

          <div class="section-title">Itemized Transactions</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th>Note</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${transactionRows || '<tr><td colspan="5" style="padding: 12px; text-align: center; color: #9ca3af;">No transactions recorded for this month</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            Generated automatically by Spendy — Your Premium Financial Companion
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Export ${monthHeaderLabel} Report (PDF)`,
        UTI: 'com.adobe.pdf',
      });
    }

    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  }
};
