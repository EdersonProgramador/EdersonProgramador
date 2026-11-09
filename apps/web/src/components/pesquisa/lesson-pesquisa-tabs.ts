import { COURSES_UI } from "@ederson-agencia/shared";
import type { LessonPesquisaTab } from "../../lib/lesson-google-pesquisa";

export const TABS: { id: LessonPesquisaTab; label: string }[] = [
  { id: "all", label: COURSES_UI.study.pesquisaTabAll },
  { id: "trusted", label: COURSES_UI.study.pesquisaTabTrusted },
  { id: "videos", label: COURSES_UI.study.pesquisaTabVideos },
  { id: "news", label: COURSES_UI.study.pesquisaTabNews },
  { id: "scholar", label: COURSES_UI.study.pesquisaTabScholar },
  { id: "books", label: COURSES_UI.study.pesquisaTabBooks }
];
