import { useEffect, useState } from "react";
import { errorMessage } from "@/lib/errors";
import { formatHealth } from "@/lib/health";
import { fetchHealth } from "@/services/health";

export function useHealth(): string {
  const [health, setHealth] = useState("loading...");

  useEffect(() => {
    fetchHealth()
      .then((body) => setHealth(formatHealth(body)))
      .catch((error: unknown) => setHealth(errorMessage(error)));
  }, []);

  return health;
}
