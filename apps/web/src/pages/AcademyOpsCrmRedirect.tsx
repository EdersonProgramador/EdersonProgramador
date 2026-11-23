import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { AGENCY_CRM_BASE } from "@ederson-agencia/shared";

/**
 * URLs legadas `/agencia/admin/academia/*` → CRM (`?view=academy`).
 */
export function AcademyOpsCrmRedirect() {
  const { "*": rest } = useParams<{ "*": string }>();
  const contentMatch = rest?.match(/^cursos\/([^/]+)\/conteudo(?:\/|$)/);
  const courseId = contentMatch?.[1];
  const isAnalysis = rest === "analise" || rest?.startsWith("analise/");

  useEffect(() => {
    const target = new URL(`${AGENCY_CRM_BASE}/`, window.location.origin);
    target.searchParams.set("view", "academy");
    if (courseId) {
      target.searchParams.set("academyCourseId", courseId);
    } else if (isAnalysis) {
      target.searchParams.set("academyTab", "analysis");
    }
    window.location.replace(`${target.pathname}${target.search}`);
  }, [rest, courseId, isAnalysis]);

  return (
    <p className="text-sm text-gray-500" role="status">
      Abrindo Academia no CRM…
    </p>
  );
}