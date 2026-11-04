import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const outDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "apps/web/public/dev-tech-icons"
);
fs.mkdirSync(outDir, { recursive: true });

/** optionId -> list of URLs to try (first SVG/PNG that works wins). */
const SOURCES = {
  hotmart: [
    "https://upload.wikimedia.org/wikipedia/commons/2/2f/Hotmart_logo.svg",
    "https://irp-cdn.multiscreensite.com/369ae728/dms3rep/multi/hotmart-logo.svg"
  ],
  kiwify: ["https://kiwify.com.br/favicon.svg", "https://kiwify.com.br/images/logo.svg"],
  asaas: ["https://www.asaas.com/favicon.svg", "https://blog.asaas.com/wp-content/uploads/2023/03/logo-asaas.svg"],
  pagarme: ["https://pagar.me/favicon.ico"],
  iugu: ["https://www.iugu.com/favicon.ico"],
  eduzz: ["https://www.eduzz.com/favicon.ico"],
  monetizze: ["https://monetizze.com.br/favicon.ico"],
  activecampaign: [
    "https://www.vectorlogo.zone/logos/activecampaign/activecampaign-ar21.svg",
    "https://www.activecampaign.com/favicon.ico"
  ],
  "activecampaign-mail": [
    "https://www.vectorlogo.zone/logos/activecampaign/activecampaign-ar21.svg"
  ],
  sendgrid: ["https://www.vectorlogo.zone/logos/sendgrid/sendgrid-icon.svg"],
  postmark: ["https://www.vectorlogo.zone/logos/postmark/postmark-ar21.svg"],
  grpc: ["https://www.vectorlogo.zone/logos/grpc/grpc-ar21.svg"],
  memcached: ["https://www.vectorlogo.zone/logos/memcached/memcached-ar21.svg"],
  pinecone: ["https://www.pinecone.io/favicon.svg"],
  inngest: ["https://www.inngest.com/favicon.svg", "https://www.inngest.com/icon.svg"],
  elysia: ["https://elysiajs.com/favicon.svg", "https://elysiajs.com/assets/elysia.svg"],
  "webhooks-native": ["https://www.vectorlogo.zone/logos/github/github-icon.svg"],
  ses: ["https://cdn.jsdelivr.net/npm/simple-icons@11.14.0/icons/amazonsimpleemailservice.svg"],
  bullmq: ["https://better-logo.com/logo/bullmq"],
  leadlovers: ["https://www.leadlovers.com/favicon.ico"]
};

async function download(id, urls) {
  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) continue;
      const ct = res.headers.get("content-type") ?? "";
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 80) continue;
      let ext = ".svg";
      if (ct.includes("png") || url.endsWith(".png")) ext = ".png";
      if (ct.includes("x-icon") || url.endsWith(".ico")) ext = ".ico";
      const file = path.join(outDir, `${id}${ext}`);
      fs.writeFileSync(file, buf);
      console.log("OK", id, "from", url, "->", path.basename(file));
      return ext;
    } catch {
      /* try next */
    }
  }
  console.log("FAIL", id);
  return null;
}

for (const [id, urls] of Object.entries(SOURCES)) {
  await download(id, urls);
}
