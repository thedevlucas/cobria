export function removeBlankSpaces(name: string) {
  name = name.replace(/\s+/g, " ").trim();
  return name;
}
