import { useEffect, useState } from "react";
import { HEALTH_LOADING_MESSAGE } from "@/constants/health";
import { errorMessage } from "@/lib/errors";
import { formatHealth } from "@/lib/health";
import { fetchHealth } from "@/services/health";

export function useHealth(): string {
  const [health, setHealth] = useState(HEALTH_LOADING_MESSAGE);

  useEffect(() => {
    fetchHealth()
      .then((body) => setHealth(formatHealth(body)))
      .catch((error: unknown) => setHealth(errorMessage(error)));
  }, []);

  return health;
}
