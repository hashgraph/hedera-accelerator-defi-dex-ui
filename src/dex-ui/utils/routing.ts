export function getLastPathInRoute(path: string) {
  return path.split("/").at(-1) ?? "";
}
