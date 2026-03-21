const blocked = ["rm -rf", "mkfs", "shutdown", "reboot"];

export function isSafe(command) {
  return !blocked.some((b) => command.includes(b));
}