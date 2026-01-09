'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet as WalletIcon, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getWalletData } from './actions'

type Transaction = {
    id: string
    amount: number
    type: string
    description: string
    created_at: string
}

export default function WalletClient() {
    const [isLoading, setIsLoading] = useState(true)
    const [balance, setBalance] = useState(0)
    const [transactions, setTransactions] = useState<Transaction[]>([])

    useEffect(() => {
        loadWalletData()
    }, [])

    const loadWalletData = async () => {
        setIsLoading(true)
        const data = await getWalletData()

        if (data) {
            setBalance(data.balance)
            setTransactions(data.transactions)
        }

        setIsLoading(false)
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-muted animate-pulse rounded" />
                <div className="h-64 bg-muted animate-pulse rounded" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Wallet</h2>
                <p className="text-muted-foreground mt-1">
                    Manage your wallet balance and transactions
                </p>
            </div>

            {/* Balance Card */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <WalletIcon className="h-5 w-5" />
                        Wallet Balance
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-4xl font-bold">₹{balance.toFixed(2)}</div>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Usable only for subscription purchases
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                        Your wallet activity and credits
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <WalletIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No transactions yet</p>
                            <p className="text-sm">Earn credits by inviting friends!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${transaction.amount > 0
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-red-100 text-red-600'
                                            }`}>
                                            {transaction.amount > 0 ? (
                                                <TrendingUp className="h-5 w-5" />
                                            ) : (
                                                <TrendingDown className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{transaction.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(transaction.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
