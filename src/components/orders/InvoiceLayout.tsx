'use client'

import { Card, CardContent } from '@/components/ui/card'

interface InvoiceLayoutProps {
    order: any
    profile: any
    businessEmail: string
    displayName: string
}

export function InvoiceLayout({ order, profile, businessEmail, displayName }: InvoiceLayoutProps) {
    return (
        <Card
            id="invoice-content"
            className="p-4 sm:p-8 rounded-2xl shadow-md border-0 bg-white print:shadow-none print:border-none print:p-0 overflow-hidden"
        >
            <CardContent className="p-0">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
                    {/* Left side - Logo + Names */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            {profile?.avatar_url ? (
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl  overflow-hidden ">
                                    <img
                                        src={profile.avatar_url}
                                        alt={displayName}
                                        className="h-full w-full object-contain p-1"
                                    />
                                </div>
                            ) : null}
                            <div>
                                <h1 className="text-2xl font-bold leading-tight">
                                    {displayName}
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Invoice Info */}
                    <div className="text-left sm:text-right w-full sm:w-auto">
                        <h2 className="text-2xl sm:text-3xl font-bold text-muted-foreground">
                            INVOICE
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Order ID: #{order.order_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Date: {new Date(order.created_at).toLocaleDateString('en-IN')}
                        </p>
                    </div>
                </div>

                {/* Bill To */}
                {order.customers && (
                    <div className="mb-6 sm:mb-8">
                        <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">
                            Bill To
                        </h3>
                        <p className="font-semibold text-sm sm:text-base">
                            {order.customers.name}
                        </p>
                        {order.customers.address_line1 && (
                            <>
                                <p className="text-sm">{order.customers.address_line1}</p>
                                {order.customers.address_line2 && (
                                    <p className="text-sm">{order.customers.address_line2}</p>
                                )}
                                <p className="text-sm">
                                    {order.customers.city}, {order.customers.state} -{' '}
                                    {order.customers.pincode}
                                </p>
                            </>
                        )}
                        <p className="text-sm">{order.customers.phone}</p>
                    </div>
                )}

                {/* Items Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm border-collapse">
                        <thead className="bg-muted">
                            <tr className="border-b">
                                <th className="p-3 text-left font-medium">Item</th>
                                <th className="p-3 text-center font-medium">Quantity</th>
                                <th className="p-3 text-right font-medium">Unit Price</th>
                                <th className="p-3 text-right font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.order_items?.map((item: any) => (
                                <tr key={item.id} className="border-b hover:bg-muted/40">
                                    <td className="p-3">{item.product_name}</td>
                                    <td className="p-3 text-center">{item.quantity}</td>
                                    <td className="p-3 text-right">
                                        ₹{parseFloat(item.unit_selling_price).toFixed(2)}
                                    </td>
                                    <td className="p-3 text-right">
                                        ₹{parseFloat(item.subtotal).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mt-6 sm:mt-8">
                    <div className="w-full sm:max-w-xs space-y-2 text-sm sm:text-base">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>₹{parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-green-500">
                                <span>Discount</span>
                                <span>-₹{parseFloat(order.discount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t my-2"></div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Amount Paid</span>
                            <span>
                                ₹
                                {order.payment_status === 'paid'
                                    ? parseFloat(order.total_amount).toFixed(2)
                                    : '0.00'}
                            </span>
                        </div>
                        <div className="flex justify-between text-red-500 font-bold">
                            <span>Amount Due</span>
                            <span>
                                ₹
                                {order.payment_status === 'paid'
                                    ? '0.00'
                                    : parseFloat(order.total_amount).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-10 sm:mt-16 text-center text-xs sm:text-sm text-muted-foreground border-t pt-6">
                    <p>Thank you for your business!</p>
                    <p>
                        For any questions, contact us at{' '}
                        <a
                            href={`mailto:${businessEmail}`}
                            className="font-medium text-primary hover:underline"
                        >
                            {businessEmail}
                        </a>
                    </p>
                    <div className="mt-4 ">
                        <a
                            href="https://resellerpro.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] sm:text-xs font-medium"
                        >
                            Generated by <span className="text-primary font-bold">ResellerPro</span>
                        </a>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
