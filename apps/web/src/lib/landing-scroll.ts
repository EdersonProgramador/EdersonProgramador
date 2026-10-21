export function scrollToLandingTop() {
  const hero = document.getElementById("topo");
  if (hero) {
    hero.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  window.history.replaceState(null, "", window.location.pathname);
}
