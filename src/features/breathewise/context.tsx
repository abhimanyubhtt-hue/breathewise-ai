import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cities, defaultCity, initialHousehold, type Household } from "./domain";
import { fetchEnvironment, saveHousehold, readHousehold } from "./data.functions";
export const environmentOptions = (city: (typeof cities)[number]) =>
  queryOptions({
    queryKey: ["environment", city.lat, city.lon],
    queryFn: () => fetchEnvironment({ data: city }),
    staleTime: 300000,
  });
function useStateModel() {
  const [city, setCity] = useState(defaultCity);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [household, setHousehold] = useState<Household>(initialHousehold);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const read = useServerFn(readHousehold);
  const save = useServerFn(saveHousehold);
  const environment = useQuery(environmentOptions(city));
  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setUser(data.user);
      if (data.user) {
        try {
          const saved = await read();
          if (saved && active) setHousehold(saved);
        } catch {
          toast.error("Could not load your saved family.");
        }
      } else setHousehold(initialHousehold);
    };
    void load();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event))
        setTimeout(() => void load(), 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [read]);
  async function persist(next: Household) {
    setHousehold(next);
    if (!user) {
      toast.info("Sign in to save your family across visits.");
      return;
    }
    setSaving(true);
    try {
      await save({ data: next });
      toast.success(language === "hi" ? "सहेजा गया" : "Saved to your household");
    } catch {
      toast.error("Changes could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }
  return {
    city,
    setCity,
    language,
    setLanguage,
    household,
    setHousehold,
    user,
    environment,
    persist,
    saving,
    t: (en: string, hi: string) => (language === "hi" ? hi : en),
  };
}
const Context = createContext<ReturnType<typeof useStateModel> | null>(null);
export function BreatheProvider({ children }: { children: ReactNode }) {
  const model = useStateModel();
  return <Context.Provider value={model}>{children}</Context.Provider>;
}
export function useBreathe() {
  const value = useContext(Context);
  if (!value) throw new Error("BreatheProvider required");
  return value;
}
