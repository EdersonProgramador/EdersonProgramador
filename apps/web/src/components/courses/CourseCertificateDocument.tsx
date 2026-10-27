import { AGENCY_META, COURSES_UI } from "@ederson-agencia/shared";
import { BrandLogo } from "../brand/BrandLogo";
import "../../styles/course-certificate.css";

export type CertificateData = {
  studentName: string;
  courseTitle: string;
  verificationCode: string;
  issuedAt: string;
  completedAt: string;
  lessonCount: number;
  verifyUrl: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export function CourseCertificateDocument({ data }: { data: CertificateData }) {
  return (
    <div className="course-certificate">
      <div className="course-certificate__frame">
        <div className="course-certificate__corner course-certificate__corner--tl" aria-hidden />
        <div className="course-certificate__corner course-certificate__corner--tr" aria-hidden />
        <div className="course-certificate__corner course-certificate__corner--bl" aria-hidden />
        <div className="course-certificate__corner course-certificate__corner--br" aria-hidden />

        <header className="course-certificate__header">
          <BrandLogo size="sm" />
          <p className="course-certificate__org">{COURSES_UI.study.certificateSubtitle}</p>
        </header>

        <p className="course-certificate__eyebrow">{COURSES_UI.study.certificateHeading}</p>

        <p className="course-certificate__label">{COURSES_UI.study.certificateAwardedTo}</p>
        <h1 className="course-certificate__name">{data.studentName}</h1>

        <p className="course-certificate__label mt-6">{COURSES_UI.study.certificateCompleted}</p>
        <h2 className="course-certificate__course">{data.courseTitle}</h2>
        <p className="course-certificate__meta">{COURSES_UI.study.certificateLessons(data.lessonCount)}</p>

        <div className="course-certificate__dates">
          <p>
            <span className="course-certificate__date-label">{COURSES_UI.study.certificateOnDate}</span>
            <span>{formatDate(data.completedAt)}</span>
          </p>
          <p>
            <span className="course-certificate__date-label">{COURSES_UI.study.certificateIssued}</span>
            <span>{formatDate(data.issuedAt)}</span>
          </p>
        </div>

        <footer className="course-certificate__footer">
          <div>
            <p className="course-certificate__code-label">{COURSES_UI.study.certificateCode}</p>
            <p className="course-certificate__code">{data.verificationCode}</p>
          </div>
          <div className="course-certificate__verify">
            <p className="course-certificate__code-label">{COURSES_UI.study.certificateVerifyHint}</p>
            <p className="course-certificate__verify-url">{data.verifyUrl.replace(/^https?:\/\//, "")}</p>
          </div>
        </footer>

        <p className="course-certificate__domain">{AGENCY_META.domain.replace(/^https?:\/\//, "")}</p>
      </div>
    </div>
  );
}
