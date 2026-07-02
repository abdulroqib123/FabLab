import { supabase } from "../supabase.js";

export async function getAllProjects() {
  let { data: projects, error } = await supabase.from("projects").select("*");

  if (error) return console.log(error);

  return projects;
}

export async function getProjectById(projectId) {
  let { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) return console.log(error);

  return project;
}

export async function getprojectsByCount(limit) {
  let { data: projects, error } = await supabase
  .from("projects")
  .select("*")
  .limit(limit);

  if (error) return console.log(error);

  return projects;
}

export async function getMintstepsProjects() {
    let { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_mintsteps", true)

    if (error) return console.log(error);

    return projects;
}