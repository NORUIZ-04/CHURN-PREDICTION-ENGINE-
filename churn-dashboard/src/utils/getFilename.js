export function getFilename(path) {
  if (!path) return "";
  return path.split(/[/\\]/).pop();
}
