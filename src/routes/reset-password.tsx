import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password · BreatheWise AI" },
      { name: "description", content: "Securely reset your BreatheWise AI password." },
      { property: "og:title", content: "Reset password · BreatheWise AI" },
      { property: "og:description", content: "Recover access to your private household." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reset,
});
function Reset() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="tool-panel reset-panel">
      <h1>Set a new password</h1>
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ password });
          setBusy(false);
          if (error) toast.error(error.message);
          else toast.success("Your password has been updated.");
        }}
      >
        <label>
          New password
          <Input
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <Button disabled={busy}>Update password</Button>
      </form>
    </section>
  );
}
