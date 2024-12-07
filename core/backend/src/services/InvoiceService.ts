// core/backend/src/services/InvoiceService.ts

import { prisma } from '../prisma';
import { PDFGenerator } from '../utils/PDFGenerator';
import { EmailService } from './EmailService';
import {
  Invoice,
  InvoiceStatus,
  InvoiceItem,
  InvoiceTemplate
} from '../types/billing.types';

export class InvoiceService {
  private pdfGenerator: PDFGenerator;
  private emailService: EmailService;

  constructor() {
    this.pdfGenerator = new PDFGenerator();
    this.emailService = new EmailService();
  }

  async generateInvoice(subscriptionId: string): Promise<Invoice> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: true,
        plan: true,
        usage: true
      }
    });

    if (!subscription) throw new Error('Subscription not found');

    // Calculate invoice items
    const invoiceItems = await this.calculateInvoiceItems(subscription);
    const total = this.calculateTotal(invoiceItems);

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        subscriptionId,
        userId: subscription.userId,
        number: await this.generateInvoiceNumber(),
        items: invoiceItems,
        subtotal: total.subtotal,
        tax: total.tax,
        total: total.total,
        status: 'pending',
        dueDate: this.calculateDueDate(),
        billingPeriodStart: subscription.currentPeriodStart,
        billingPeriodEnd: subscription.currentPeriodEnd
      }
    });

    // Generate PDF
    await this.generateInvoicePDF(invoice);

    // Send invoice email
    await this.sendInvoiceEmail(invoice);

    return invoice;
  }

  async processInvoicePayment(invoiceId: string): Promise<Invoice> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { subscription: true }
    });

    if (!invoice) throw new Error('Invoice not found');

    try {
      // Process payment
      await this.processPayment(invoice);

      // Update invoice status
      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'paid',
          paidAt: new Date()
        }
      });

      // Send receipt
      await this.sendReceiptEmail(updatedInvoice);

      return updatedInvoice;
    } catch (error) {
      await this.handleFailedPayment(invoice);
      throw error;
    }
  }

  async sendReminder(invoiceId: string): Promise<void> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: true }
    });

    if (!invoice) throw new Error('Invoice not found');

    // Send reminder email
    await this.emailService.sendInvoiceReminder(invoice);

    // Update reminder count
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        remindersSent: {
          increment: 1
        },
        lastReminderSent: new Date()
      }
    });
  }

  private async calculateInvoiceItems(subscription: any): Promise<InvoiceItem[]> {
    const items: InvoiceItem[] = [];

    // Base subscription charge
    items.push({
      description: `${subscription.plan.name} Plan`,
      amount: subscription.plan.price,
      quantity: 1,
      type: 'subscription'
    });

    // Usage-based charges
    const usageCharges = await this.calculateUsageCharges(subscription);
    items.push(...usageCharges);

    // Add-ons
    const addOnCharges = await this.calculateAddOnCharges(subscription);
    items.push(...addOnCharges);

    return items;
  }

  private calculateTotal(items: InvoiceItem[]): {
    subtotal: number;
    tax: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
    const tax = this.calculateTax(subtotal);
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  }

  private async generateInvoicePDF(invoice: Invoice): Promise<void> {
    const template = await this.getInvoiceTemplate(invoice);
    await this.pdfGenerator.generateInvoice(invoice, template);
  }

  private async getInvoiceTemplate(invoice: Invoice): Promise<InvoiceTemplate> {
    // Get organization's custom template or use default
    return {
      // Template configuration
    };
  }

  private async handleFailedPayment(invoice: Invoice): Promise<void> {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'overdue',
        failedPayments: {
          increment: 1
        }
      }
    });

    // Send notification
    await this.emailService.sendPaymentFailedNotification(invoice);
  }

  async monitorInvoices(): Promise<void> {
    // Check for overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: 'pending',
        dueDate: {
          lt: new Date()
        }
      }
    });

    for (const invoice of overdueInvoices) {
      await this.handleOverdueInvoice(invoice);
    }

    // Send reminders for upcoming due dates
    const upcomingInvoices = await prisma.invoice.findMany({
      where: {
        status: 'pending',
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
        },
        remindersSent: 0
      }
    });

    for (const invoice of upcomingInvoices) {
      await this.sendReminder(invoice.id);
    }
  }
}
