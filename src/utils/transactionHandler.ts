import { supabase } from "@/lib/supabase";

interface Payment {
  id: number;
  payment_id: string;
  hash: string;
  created_at: string;
}

export const addTransaction = async (payment_id: string | number, hash: string) => {
  const { error } = await supabase
    .from("payments")
    .insert({ 
      payment_id: payment_id.toString(), // Convert to string to handle both number and string IDs
      hash 
    });
  if (error) throw new Error(error.message);
};

export const findTransaction = async (hash: string): Promise<Payment[] | null> => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("hash", hash);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};
