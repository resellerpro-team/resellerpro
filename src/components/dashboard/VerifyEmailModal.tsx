'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { verifyOtp } from '@/app/actions/verify-otp'
import { sendVerificationOtp } from '@/app/actions/send-verification-otp'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VerifyEmailModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    email: string
    onVerified?: () => void
}

export function VerifyEmailModal({ open, onOpenChange, email, onVerified }: VerifyEmailModalProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [step, setStep] = useState<'send' | 'verify'>('send')
    const [otp, setOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0)

    // Reset step when modal opens/closes
    useEffect(() => {
        if (open) {
            setStep('send')
            setOtp('')
        }
    }, [open])

    // Countdown timer logic
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [timeLeft])

    const handleSendCode = async () => {
        setResendLoading(true)
        try {
            const res = await sendVerificationOtp(email)

            if (res.success) {
                toast({
                    title: 'Code Sent',
                    description: `We've sent a code to ${email}`,
                })
                setStep('verify')
                setTimeLeft(60)
            } else {
                if (res.alreadyVerified) {
                    toast({ title: 'Already Verified', description: 'Your email is already verified.', })
                    onOpenChange(false)
                    router.refresh()
                    return
                }
                toast({
                    title: 'Failed to Send',
                    description: res.message,
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to send code.', variant: 'destructive' })
        } finally {
            setResendLoading(false)
        }
    }

    const handleVerify = async () => {
        if (otp.length !== 6) return

        setIsLoading(true)
        try {
            const res = await verifyOtp(email, otp)

            if (res.success) {
                toast({
                    title: 'Verified!',
                    description: 'Your email has been successfully verified.',
                    action: <CheckCircle2 className="h-5 w-5 text-green-500" />
                })
                onOpenChange(false)
                router.refresh()
                if (onVerified) onVerified()
            } else {
                toast({
                    title: 'Verification Failed',
                    description: res.message,
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Verify your email</DialogTitle>
                    <DialogDescription>
                        {step === 'send'
                            ? `Click below to receive a verification code at ${email}`
                            : `Enter the 6-digit code sent to ${email}`
                        }
                    </DialogDescription>
                </DialogHeader>

                {step === 'send' ? (
                    <div className="py-6">
                        <Button
                            className="w-full"
                            onClick={handleSendCode}
                            disabled={resendLoading}
                        >
                            {resendLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending Code...
                                </>
                            ) : (
                                'Send Verification Code'
                            )}
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col space-y-4 py-4">
                            <Input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                placeholder="000000"
                                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                                autoFocus
                            />

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Didn't receive code?</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSendCode}
                                    disabled={timeLeft > 0 || resendLoading}
                                    className="h-auto p-0 text-blue-600 font-medium hover:text-blue-700 hover:bg-transparent"
                                >
                                    {resendLoading ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    ) : null}
                                    {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend Code'}
                                </Button>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                className="w-full"
                                onClick={handleVerify}
                                disabled={otp.length !== 6 || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Email'
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
