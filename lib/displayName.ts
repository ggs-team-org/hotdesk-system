export function displayName(name: string | null, email: string): string {
  if (name && name.trim()) return name;
  const local = email.split("@")[0];
  return local || "Unnamed";
}
