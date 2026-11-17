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
      <div className="landing-container relative z-[1] flex flex-col items-center text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/90">
          Da ideia ao lançamento com <span className="funnel-hero__neon">maestria</span>
        </p>
        <h1 className="funnel-hero__headline mx-auto mt-3 max-w-4xl">
          Descubra como <mark className="funnel-hero__mark">empresários</mark> e pessoas comuns estão
          transformando ideias simples em <mark className="funnel-hero__mark">negócios lucrativos</mark>.
        </h1>
        <p className="funnel-hero__sub mx-auto">{vsl.subhead}</p>

        <div className="funnel-vsl mx-auto mt-8 w-full max-w-3xl">
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
                backgroundImage: `linear-gradient(rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.72)), url('/funnel/parceria-fechada.svg')`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              {videoId ? (
                <p className="max-w-md text-sm text-white/80">{vsl.videoHint}</p>
              ) : (
                <div className="max-w-lg space-y-2 px-2">
                  <p className="font-display text-xl font-bold leading-snug tracking-[-0.02em] text-white sm:text-2xl">
                    {vsl.overlayHeadline}
                  </p>
                  <p className="text-sm leading-relaxed text-white/75 sm:text-base">{vsl.overlaySubhead}</p>
                </div>
              )}
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
          className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-semibold text-white/50 hover:text-white"
        >
          <Youtube className="h-4 w-4" aria-hidden />
          {vsl.youtubeLabel}
        </a>

        <div className="mt-8 flex w-full max-w-xl flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
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
