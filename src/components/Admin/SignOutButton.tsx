import { LogOut } from "lucide-react";
import { signOut } from "@/app/auth/actions";

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-500 hover:bg-gray-100"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign Out</span>
      </button>
    </form>
  );
}
