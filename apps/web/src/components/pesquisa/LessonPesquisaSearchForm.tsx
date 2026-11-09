import { COURSES_UI } from "@ederson-agencia/shared";
import { Search } from "lucide-react";
import type { LessonPesquisaSearch } from "./useLessonPesquisaSearch";

type Props = {
  search: LessonPesquisaSearch;
  inputId: string;
  className?: string;
  /** Barra principal no cabeçalho do modo tela cheia */
  variant?: "toolbar" | "header";
  showSubmitButton?: boolean;
};

export function LessonPesquisaSearchForm({
  search,
  inputId,
  className = "",
  variant = "toolbar",
  showSubmitButton = true
}: Props) {
  return (
    <div
      className={`course-study-pesquisa-mode__search${variant === "header" ? " course-study-pesquisa-mode__search--header" : ""} ${className}`.trim()}
    >
      <label className="sr-only" htmlFor={inputId}>
        {COURSES_UI.study.pesquisaSearchLabel}
      </label>
      <input
        id={inputId}
        type="search"
        className="course-study-pesquisa-mode__search-input"
        value={search.draftQuery}
        onChange={(e) => search.setDraftQuery(e.target.value)}
        placeholder={COURSES_UI.study.pesquisaSearchPlaceholder}
        autoComplete="off"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            search.submitSearch();
          }
        }}
      />
      {showSubmitButton ? (
        <button type="submit" className="course-study-pesquisa-mode__search-btn btn-primary">
          <Search className="h-4 w-4" aria-hidden />
          <span className={variant === "header" ? "hidden sm:inline" : undefined}>
            {COURSES_UI.study.pesquisaSearchSubmit}
          </span>
        </button>
      ) : null}
    </div>
  );
}
