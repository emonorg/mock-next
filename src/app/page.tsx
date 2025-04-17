import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to Our Platform</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-lg">
        A secure and modern authentication system built with Next.js, featuring
        multiple sign-in options and email verification.
      </p>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/signup">Create Account</Link>
        </Button>
      </div>
    </div>
  );
}
