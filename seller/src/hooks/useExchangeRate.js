import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useExchangeRate() {
  const [rate, setRate] = useState(0.89);
  useEffect(() => {
    const fetchRate = async () => {
      const { data } = await supabase
        .from("exchange_rates")
        .select("rate")
        .eq("from_currency", "NGN")
        .eq("to_currency", "XOF")
        .maybeSingle();
      if (data?.rate) setRate(data.rate);
    };
    fetchRate();
  }, []);
  return rate;
}
