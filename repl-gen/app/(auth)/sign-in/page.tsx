import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
        </div>
        <SignIn routing="hash" afterSignInUrl="/dashboard" />
      </div>
    </div>
  )
}
