'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ProfileForm from '@/components/settings/ProfileForm'
import { useProfile } from '@/lib/react-query/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function ProfileClient({ initialData }: { initialData?: any }) {
    const { data: user, isLoading, error } = useProfile(initialData)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || (!isLoading && !user)) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-destructive gap-4">
                <p>Error loading profile data. Please refresh the page.</p>
                <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="sm:text-3xl text-[25px] font-bold tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground text-[15px]">
                    Manage your personal information and preferences
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        Update your profile details. Your email cannot be changed for security reasons.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* 
              ProfileForm likely expects 'user' prop. 
              Checking previous code (step 36): <ProfileForm user={userData} />
            */}
                    <ProfileForm user={user} />
                </CardContent>
            </Card>
        </div>
    )
}
