export function getLastPathInRoute(path: string) {
  return path.split("/").at(-1) ?? "";
}

export function replaceLastRoute(path: string, newLastRoute: string) {
  const paths = path.split("/");
  return `${paths
    .slice(0, paths.length - 1)
    .toString()
    .replaceAll(",", "/")}/${newLastRoute}`;
}
