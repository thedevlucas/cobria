export function capitalizeWords(name: string) {
  const newName = name.toLowerCase();
  return newName.replace(/(^\w{1})|(\s+\w{1})/g, (match) =>
    match.toUpperCase()
  );
}
