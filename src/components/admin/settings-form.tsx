// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert"

// export function SettingsForm() {
//   const [loading, setLoading] = useState(false)
//   const [success, setSuccess] = useState(false)
//   const [error, setError] = useState<string>("")

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault()
//     setLoading(true)
//     setSuccess(false)
//     setError("")

//     const formData = new FormData(e.currentTarget)
//     const systemName = formData.get("systemName") as string
//     const adminEmail = formData.get("adminEmail") as string

//     try {
//       // Simulate API call to update settings
//       await new Promise((resolve) => setTimeout(resolve, 1000))
//       setSuccess(true)
//     } catch (err) {
//       setError("Failed to update settings. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="space-y-2">
//         <Label htmlFor="systemName">System Name</Label>
//         <Input
//           id="systemName"
//           name="systemName"
//           defaultValue="ResellerPro"
//           placeholder="Enter system name"
//         />
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="adminEmail">Admin Email</Label>
//         <Input
//           id="adminEmail"
//           name="adminEmail"
//           type="email"
//           defaultValue="admin@exXXXX.com"
//           placeholder="Enter admin email"
//         />
//       </div>
//       {success && (
//         <Alert variant="success">
//           <AlertDescription>Settings updated successfully!</AlertDescription>
//         </Alert>
//       )}
//       {error && (
//         <Alert variant="destructive">
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
//       <Button type="submit" className="w-full" disabled={loading}>
//         {loading ? "Saving..." : "Save Changes"}
//       </Button>
//     </form>
//   )
// }


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SettingsForm() {
  // ✅ keep all your logic here
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string>("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError("")

    const formData = new FormData(e.currentTarget)
    const systemName = formData.get("systemName") as string
    const adminEmail = formData.get("adminEmail") as string

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch (err) {
      setError("Failed to update settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 shadow-lg transition-all hover:border-indigo-500/30"
    >
      <div className="space-y-2">
        <Label htmlFor="systemName" className="text-gray-300">
          System Name
        </Label>
        <Input
          id="systemName"
          name="systemName"
          defaultValue="ResellerPro"
          placeholder="Enter system name"
          className="bg-white/[0.08] border border-white/[0.15] text-gray-100 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adminEmail" className="text-gray-300">
          Admin Email
        </Label>
        <Input
          id="adminEmail"
          name="adminEmail"
          type="email"
          defaultValue="admin@exXXXX.com"
          placeholder="Enter admin email"
          className="bg-white/[0.08] border border-white/[0.15] text-gray-100 placeholder:text-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Alerts */}
      {success && (
        <Alert className="border-green-400/30 bg-green-500/10 text-green-300">
          <AlertDescription>
            Settings updated successfully!
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert className="border-red-400/30 bg-red-500/10 text-red-300">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-medium py-2 rounded-lg shadow-md hover:shadow-indigo-500/25 hover:from-indigo-400 hover:to-blue-400 transition-all duration-200"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}

