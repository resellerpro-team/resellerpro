'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Wallet, CreditCard, Sparkles } from 'lucide-react'

type PaymentMethodDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    planName: string
    planPrice: number
    walletBalance: number
    onConfirm: (method: 'wallet' | 'razorpay' | 'wallet+razorpay') => void
    isLoading?: boolean
}

export function PaymentMethodDialog({
    open,
    onOpenChange,
    planName,
    planPrice,
    walletBalance,
    onConfirm,
    isLoading = false
}: PaymentMethodDialogProps) {
    const canPayWithWallet = walletBalance >= planPrice
    const canUsePartialWallet = walletBalance > 0 && walletBalance < planPrice
    const remainingAmount = Math.max(0, planPrice - walletBalance)

    const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'razorpay' | 'wallet+razorpay'>(
        canPayWithWallet ? 'wallet' : canUsePartialWallet ? 'wallet+razorpay' : 'razorpay'
    )

    const handleConfirm = () => {
        onConfirm(selectedMethod)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Choose Payment Method</DialogTitle>
                    <DialogDescription>
                        Select how you'd like to pay for {planName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Plan Summary */}
                    <div className="rounded-lg border p-4 bg-muted/50">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Plan Price</span>
                            <span className="font-bold text-lg">₹{planPrice}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">Wallet Balance</span>
                            <span className="font-semibold">₹{walletBalance.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Options */}
                    <RadioGroup value={selectedMethod} onValueChange={(value: any) => setSelectedMethod(value)}>
                        {/* Option 1: Pay with Wallet Only */}
                        {canPayWithWallet && (
                            <div className="relative">
                                <div className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${selectedMethod === 'wallet'
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                                    : 'hover:bg-muted/50'
                                    }`}>
                                    <RadioGroupItem value="wallet" id="wallet" className="mt-1" />
                                    <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Wallet className="h-4 w-4 text-primary" />
                                            <span className="font-semibold">Pay with Wallet</span>
                                            <Sparkles className="h-3 w-3 text-yellow-500" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Use ₹{planPrice} from your wallet balance
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                            ✓ Instant activation • No payment gateway fees
                                        </p>
                                    </Label>
                                </div>
                            </div>
                        )}

                        {/* Option 2: Pay with Wallet + Razorpay */}
                        {canUsePartialWallet && (
                            <div className="relative">
                                <div className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${selectedMethod === 'wallet+razorpay'
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                                    : 'hover:bg-muted/50'
                                    }`}>
                                    <RadioGroupItem value="wallet+razorpay" id="wallet+razorpay" className="mt-1" />
                                    <Label htmlFor="wallet+razorpay" className="flex-1 cursor-pointer">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Wallet className="h-4 w-4 text-primary" />
                                            <span className="font-semibold">Wallet + Card/UPI</span>
                                        </div>
                                        <div className="text-sm space-y-1">
                                            <p className="text-muted-foreground">
                                                ₹{walletBalance.toFixed(2)} from wallet + ₹{remainingAmount.toFixed(2)} via payment
                                            </p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                ✓ Save ₹{walletBalance.toFixed(2)} instantly
                                            </p>
                                        </div>
                                    </Label>
                                </div>
                            </div>
                        )}

                        {/* Option 3: Pay with Razorpay Only */}
                        <div className="relative">
                            <div className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${selectedMethod === 'razorpay'
                                ? 'border-primary bg-primary/5 ring-2 ring-primary'
                                : 'hover:bg-muted/50'
                                }`}>
                                <RadioGroupItem value="razorpay" id="razorpay" className="mt-1" />
                                <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CreditCard className="h-4 w-4 text-primary" />
                                        <span className="font-semibold">Pay with Card/UPI</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Pay ₹{planPrice} via Razorpay
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Credit/Debit Card, UPI, Net Banking
                                    </p>
                                </Label>
                            </div>
                        </div>
                    </RadioGroup>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="min-w-[120px]"
                    >
                        {isLoading ? 'Processing...' : 'Continue'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}