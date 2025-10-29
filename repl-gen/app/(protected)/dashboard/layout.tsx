import type React from "react"
import { UserButton } from "@clerk/nextjs"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* Header with User Button */}
      <div className="flex justify-end items-center p-4 border-b border-border bg-background">
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
      {children}
    </div>
  )
}
