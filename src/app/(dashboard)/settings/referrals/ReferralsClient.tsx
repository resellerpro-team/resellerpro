'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Gift, Copy, Check, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getReferralData } from './actions'

type Referral = {
    id: string
    referee_name: string
    status: 'pending' | 'converted'
    created_at: string
}

export default function ReferralsClient() {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [referralCode, setReferralCode] = useState('')
    const [referralLink, setReferralLink] = useState('')
    const [referrals, setReferrals] = useState<Referral[]>([])

    useEffect(() => {
        loadReferralData()
    }, [])

    const loadReferralData = async () => {
        setIsLoading(true)
        const data = await getReferralData()

        if (data) {
            setReferralCode(data.referralCode)
            setReferralLink(data.referralLink)
            setReferrals(data.referrals)
        }

        setIsLoading(false)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast({
            title: 'Copied!',
            description: 'Referral link copied to clipboard',
        })
        setTimeout(() => setCopied(false), 2000)
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
                <h2 className="text-2xl font-bold">Invite friends & earn credits</h2>
                <p className="text-muted-foreground mt-1">
                    You earn ₹75 when your friend subscribes. Your friend gets ₹50 after signup.
                </p>
            </div>

            {/* Referral Link Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5" />
                        Your Referral Link
                    </CardTitle>
                    <CardDescription>
                        Share this link with friends to earn wallet credits
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Referral Link */}
                    <div className="space-y-2">
                        <Label htmlFor="referral-link">Referral Link</Label>
                        <div className="flex gap-2">
                            <Input
                                id="referral-link"
                                value={referralLink}
                                readOnly
                                className="font-mono text-sm"
                            />
                            <Button
                                onClick={() => copyToClipboard(referralLink)}
                                variant="outline"
                                className="shrink-0"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Referral Code */}
                    <div className="space-y-2">
                        <Label htmlFor="referral-code">Referral Code</Label>
                        <div className="flex gap-2">
                            <Input
                                id="referral-code"
                                value={referralCode}
                                readOnly
                                className="font-mono text-lg font-bold max-w-[200px]"
                            />
                            <Button
                                onClick={() => copyToClipboard(referralCode)}
                                variant="outline"
                                size="sm"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Referral Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Your Referrals
                    </CardTitle>
                    <CardDescription>
                        Track your invited friends and their status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {referrals.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No referrals yet</p>
                            <p className="text-sm">Share your referral link to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {referrals.map((referral) => (
                                <div
                                    key={referral.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Users className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{referral.referee_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Joined {new Date(referral.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={referral.status === 'converted' ? 'default' : 'secondary'}
                                    >
                                        {referral.status === 'converted' ? (
                                            <>
                                                <Check className="h-3 w-3 mr-1" />
                                                Subscribed
                                            </>
                                        ) : (
                                            'Signed up'
                                        )}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
