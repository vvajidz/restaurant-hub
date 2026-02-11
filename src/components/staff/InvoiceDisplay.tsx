import { forwardRef } from 'react';
import type { Invoice } from '@/types';
import { useRestaurantStore } from '@/stores/restaurantStore';

interface InvoiceDisplayProps {
  invoice: Invoice;
}

const InvoiceDisplay = forwardRef<HTMLDivElement, InvoiceDisplayProps>(
  ({ invoice }, ref) => {
    const { settings } = useRestaurantStore();

    const paymentMethodLabels = {
      cash: 'Cash',
      card: 'Card',
      upi: 'UPI',
    };

    return (
      <div ref={ref} className="bg-background p-6 max-w-md mx-auto border rounded-lg">
        {/* Header */}
        <div className="text-center border-b border-dashed border-border pb-4 mb-4">
          <h1 className="text-xl font-bold text-foreground">{settings.name}</h1>
          <p className="text-sm text-muted-foreground">{settings.address}</p>
          <p className="text-sm text-muted-foreground">{settings.phone}</p>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-4 pb-4 border-b border-dashed border-border">
          <div>
            <span className="text-muted-foreground">Invoice ID:</span>
            <span className="ml-2 font-mono font-medium">{invoice.id}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Token #:</span>
            <span className="ml-2 font-bold text-primary">{invoice.tokenNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Table:</span>
            <span className="ml-2 font-medium">{invoice.tableNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Date:</span>
            <span className="ml-2">{new Date(invoice.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Items */}
        <div className="mb-4">
          <div className="grid grid-cols-12 text-xs font-semibold text-muted-foreground uppercase mb-2">
            <span className="col-span-6">Item</span>
            <span className="col-span-2 text-center">Qty</span>
            <span className="col-span-2 text-right">Price</span>
            <span className="col-span-2 text-right">Total</span>
          </div>
          <div className="space-y-2">
            {invoice.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 text-sm">
                <span className="col-span-6 truncate">{item.menuItem.name}</span>
                <span className="col-span-2 text-center">{item.quantity}</span>
                <span className="col-span-2 text-right">${item.menuItem.price.toFixed(2)}</span>
                <span className="col-span-2 text-right font-medium">
                  ${(item.menuItem.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-dashed border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST ({settings.taxRate}%)</span>
            <span>${invoice.gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-primary">${invoice.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mt-4 pt-4 border-t border-dashed border-border text-center">
          <span className="text-sm text-muted-foreground">Payment Method: </span>
          <span className="font-medium">{paymentMethodLabels[invoice.paymentMethod]}</span>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-dashed border-border text-center">
          <p className="text-sm text-muted-foreground">{settings.invoiceFooter}</p>
        </div>
      </div>
    );
  }
);

InvoiceDisplay.displayName = 'InvoiceDisplay';

export default InvoiceDisplay;
