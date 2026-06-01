const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
];

export function getPort(value: string | undefined) {
  if (!value) {
    return 4000;
  }

  const parsedPort = Number(value);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    return 4000;
  }

  return parsedPort;
}

export function getAllowedOrigins(value: string | undefined) {
  if (!value) {
    return defaultAllowedOrigins;
  }

  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : defaultAllowedOrigins;
}
