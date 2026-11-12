import { useState } from "react";
import { ArrowRight, Play, Youtube } from "lucide-react";
import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";
import { useLeadCaptureOptional } from "../lead-capture-context";

const vsl = LAUNCH_FUNNEL_COPY.heroVsl;

const envVideoId = import.meta.env.VITE_FUNNEL_VSL_YOUTUBE_ID as string | undefined;

export function FunnelHeroVsl() {
  const capture = useLeadCaptureOptional();
  const [soundOn, setSoundOn] = useState(false);
  const videoId = (envVideoId?.trim() || vsl.youtubeVideoId || "").trim();
  const embedSrc =
    soundOn && videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
      : null;

  return (
    <section id="topo" className="funnel-hero scroll-mt-0" data-mood-track="trust">
      <div className="landing-container relative z-[1]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/90">{vsl.pretitle}</p>
        <h1 className="funnel-hero__headline mt-3 max-w-4xl">{vsl.headline}</h1>
        <p className="funnel-hero__sub">{vsl.subhead}</p>

        <div className="funnel-vsl mt-8 max-w-3xl">
          {embedSrc ? (
            <iframe
              title="Apresentação App do Zero ao Lançamento"
              src={embedSrc}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div
              className="funnel-vsl__overlay"
              style={{
                backgroundImage: `linear-gradient(rgb(0 0 0 / 0.5), rgb(0 0 0 / 0.65)), url('/og-image.svg')`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <p className="max-w-md text-sm text-white/80">
                {videoId ? vsl.videoHint : "Configure VITE_FUNNEL_VSL_YOUTUBE_ID ou reserve sua vaga para receber o vídeo por WhatsApp."}
              </p>
              <button
                type="button"
                className="funnel-vsl__play"
                onClick={() => {
                  if (videoId) setSoundOn(true);
                  else capture?.openCapture();
                }}
              >
                <Play className="h-5 w-5 fill-current" aria-hidden />
                {videoId ? vsl.videoCta : vsl.primaryCta}
              </button>
            </div>
          )}
        </div>

        <a
          href="https://www.youtube.com/@edersonprogramador"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white"
        >
          <Youtube className="h-4 w-4" aria-hidden />
          {vsl.youtubeLabel}
        </a>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {capture ? (
            <button
              type="button"
              className="btn-primary btn-primary--urgent funnel-vsl__play w-full sm:w-auto"
              onClick={() => capture.openCapture()}
            >
              {vsl.primaryCta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          ) : (
            <a href="#contato" className="btn-primary btn-primary--urgent funnel-vsl__play w-full sm:w-auto">
              {vsl.primaryCta}
            </a>
          )}
          <a href="#pacotes" className="btn-secondary w-full sm:w-auto">
            {vsl.secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
