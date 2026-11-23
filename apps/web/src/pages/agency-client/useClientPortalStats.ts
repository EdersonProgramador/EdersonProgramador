import { useEffect, useState } from "react";
import { apiGet } from "../../api";

type ClientPortalStats = {
  projects?: number;
  awaitingApproval?: number;
};

export function useClientPortalStats() {
  const [stats, setStats] = useState<ClientPortalStats>({});
  useEffect(() => {
    void apiGet<{ stats: ClientPortalStats }>("/agency/dashboard").then((res) => setStats(res.stats));
  }, []);
  return stats;
}