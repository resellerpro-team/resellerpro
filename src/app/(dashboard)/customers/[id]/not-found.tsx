import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserX } from 'lucide-react'
import Link from 'next/link'

export default function CustomerNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <UserX className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h2 className="text-2xl font-bold">Customer Not Found</h2>
            <p className="text-muted-foreground mt-2">
              The customer you're looking for doesn't exist or you don't have permission to view it.
            </p>
          </div>
          <Button asChild>
            <Link href="/customers">Back to Customers</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}