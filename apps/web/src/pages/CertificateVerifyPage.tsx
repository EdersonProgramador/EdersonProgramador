import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AGENCY_META, COURSES_UI } from "@ederson-agencia/shared";
import { apiGet } from "../api";
import { BrandLogo } from "../components/brand/BrandLogo";
import "../styles/course-study.css";

type VerifyResponse = {
  valid: boolean;
  studentName?: string;
  courseTitle?: string;
  verificationCode?: string;
  issuedAt?: string;
  completedAt?: string;
  lessonCount?: number;
  message?: string;
};

export function CertificateVerifyPage() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    void (async () => {
      try {
        const res = await apiGet<VerifyResponse>(`/public/certificates/${encodeURIComponent(code)}`);
        setData(res);
      } catch {
        setData({ valid: false, message: COURSES_UI.study.certificateVerifyInvalid });
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  return (
    <div className="courses-academy mx-auto min-h-dvh max-w-lg px-4 py-10">
      <div className="mb-8 flex justify-center">
        <BrandLogo size="md" />
      </div>
      <h1 className="text-center text-xl font-bold text-white">{COURSES_UI.study.certificateVerifyTitle}</h1>
      {loading ? <p className="course-text-muted mt-6 text-center text-sm">Verificando…</p> : null}
      {!loading && data?.valid ? (
        <div className="panel mt-6 space-y-3 p-6 text-sm">
          <p className="text-center font-semibold text-green-300">{COURSES_UI.study.certificateVerifyValid}</p>
          <p>
            <span className="course-text-faint block text-xs uppercase">Participante</span>
            {data.studentName}
          </p>
          <p>
            <span className="course-text-faint block text-xs uppercase">Trilha</span>
            {data.courseTitle}
          </p>
          <p>
            <span className="course-text-faint block text-xs uppercase">{COURSES_UI.study.certificateCode}</span>
            <span className="font-mono text-brand-primary">{data.verificationCode}</span>
          </p>
          {data.completedAt ? (
            <p className="course-text-muted text-xs">
              {COURSES_UI.study.certificateOnDate}{" "}
              {new Date(data.completedAt).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </p>
          ) : null}
        </div>
      ) : null}
      {!loading && data && !data.valid ? (
        <p className="mt-6 text-center text-sm text-red-300">{data.message ?? COURSES_UI.study.certificateVerifyInvalid}</p>
      ) : null}
      <p className="course-text-faint mt-8 text-center text-xs">
        <Link to="/" className="text-brand-primary hover:underline">
          {AGENCY_META.domain.replace(/^https?:\/\//, "")}
        </Link>
      </p>
    </div>
  );
}
