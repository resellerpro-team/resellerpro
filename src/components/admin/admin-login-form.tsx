// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { createClient } from "@/lib/supabase/client"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert"

// export default function AdminLoginForm() {
//   const [error, setError] = useState<string>("")
//   const [loading, setLoading] = useState(false)
//   const router = useRouter()
//   const supabase = createClient()

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault()
//     setError("")
//     setLoading(true)

//     const formData = new FormData(e.currentTarget)
//     const email = formData.get("email") as string
//     const password = formData.get("password") as string

//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     })

//     if (error) {
//       setError("Invalid credentials")
//       setLoading(false)
//       return
//     }

//     router.push("/admin/dashboard")
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="space-y-2">
//         <Label htmlFor="email">Email</Label>
//         <Input 
//           id="email"
//           name="email"
//           type="email"
//           required
//           placeholder="admin@exXXXX.com"
//         />
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="password">Password</Label>
//         <Input
//           id="password"
//           name="password"
//           type="password"
//           required
//         />
//       </div>
//       {error && (
//         <Alert variant="destructive">
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
//       <Button type="submit" className="w-full" disabled={loading}>
//         {loading ? "Loading..." : "Sign In"}
//       </Button>
//     </form>
//   )
// }



"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminLoginForm() {
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Invalid credentials")
      setLoading(false)
      return
    }

    router.push("/admin/dashboard")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 text-gray-200"
    >
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="admin@exXXXX.com"
          className="bg-white/[0.05] border-white/[0.1] text-gray-100 placeholder:text-gray-500 
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="bg-white/[0.05] border-white/[0.1] text-gray-100 placeholder:text-gray-500 
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
        />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="destructive"
          className="border-red-500/40 bg-red-500/10 text-red-300"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-medium py-2.5 rounded-lg 
                   shadow-md hover:shadow-indigo-500/30 transition-all duration-300"
      >
        {loading ? "Loading..." : "Sign In"}
      </Button>

      {/* Optional helper */}
      <p className="text-center text-sm text-gray-500 mt-2">
        Access restricted to admin users only.
      </p>
    </form>
  )
}
