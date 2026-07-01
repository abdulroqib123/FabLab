import { supabase } from "../supabase.js";

export async function getAllworkshops() {
  let { data: workshops, error } = await supabase.from("workshops").select("*");

  if (error) return console.log(error);

  return workshops;
}

export async function getworkshopsByCount(limit) {
  let { data: workshops, error } = await supabase
  .from("workshops")
  .select("*")
  .limit(limit);

  if (error) return console.log(error);

  return workshops;
}