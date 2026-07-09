import { supabase } from "../supabase.js";

export async function getAllMachines() {
  let { data: machines, error } = await supabase
    .from("machines")
    .select("*")
    .order("updated_at", { ascending: false });;

  if (error) return console.log(error);

  return machines;
}

export async function getMachineById(machineId) {
  let { data: machine, error } = await supabase
    .from("machines")
    .select("*")
    .eq("id", machineId)
    .single();

  if (error) return console.log(error);

  return machine;
}

export async function getMachinesByCount(limit) {
  let { data: machines, error } = await supabase
  .from("machines")
  .select("*")
  .limit(limit);

  if (error) return console.log(error);

  return machines;
}
