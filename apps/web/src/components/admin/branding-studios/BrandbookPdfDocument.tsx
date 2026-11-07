import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { BrandbookPdfModel } from "@ederson-agencia/shared";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#0f172a"
  },
  cover: {
    marginBottom: 28,
    borderBottomWidth: 2,
    borderBottomColor: "#5b21b6",
    paddingBottom: 20
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b"
  },
  tagline: {
    marginTop: 12,
    fontSize: 13,
    fontStyle: "italic",
    color: "#5b21b6"
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#5b21b6"
  },
  paragraph: {
    marginBottom: 6,
    lineHeight: 1.45
  },
  paletteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    marginBottom: 12
  },
  swatch: {
    width: 72,
    marginRight: 8,
    marginBottom: 8
  },
  swatchColor: {
    height: 36,
    borderRadius: 4
  },
  swatchLabel: {
    fontSize: 8,
    marginTop: 4,
    color: "#475569"
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8
  },
  thumb: {
    width: 140,
    height: 100,
    objectFit: "contain"
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    fontSize: 9,
    color: "#94a3b8",
    textAlign: "center"
  }
});

type Props = BrandbookPdfModel & {
  logoImages: string[];
  moodboardImages: string[];
};

export function BrandbookPdfDocument({ sections, logoImages, moodboardImages, ...model }: Props) {
  const primary = model.palette.swatches.find((s) => s.role === "primary")?.hex ?? "#5B21B6";

  return (
    <Document title={`Brandbook — ${model.projectTitle}`}>
      <Page size="A4" style={styles.page}>
        <View style={[styles.cover, { borderBottomColor: primary }]}>
          <Text style={styles.title}>Brandbook</Text>
          <Text style={styles.subtitle}>{model.projectTitle}</Text>
          <Text style={[styles.subtitle, { marginTop: 6 }]}>Gerado em {model.generatedAt}</Text>
          {model.tagline ? <Text style={styles.tagline}>{model.tagline}</Text> : null}
        </View>

        {model.manifesto ? (
          <View>
            <Text style={styles.sectionTitle}>Manifesto</Text>
            <Text style={styles.paragraph}>{model.manifesto}</Text>
          </View>
        ) : null}

        {sections.map((sec) => (
          <View key={sec.title}>
            <Text style={[styles.sectionTitle, { color: primary }]}>{sec.title}</Text>
            {sec.lines.map((line, i) => (
              <Text key={`${sec.title}-${i}`} style={styles.paragraph}>
                {line}
              </Text>
            ))}
          </View>
        ))}

        <Text style={styles.footer}>Ederson Agência · Uso confidencial do cliente</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionTitle, { color: primary, marginTop: 0 }]}>Paleta oficial</Text>
        <View style={styles.paletteRow}>
          {model.palette.swatches
            .filter((s) => s.hex.trim())
            .map((s) => (
              <View key={s.id} style={styles.swatch}>
                <View style={[styles.swatchColor, { backgroundColor: s.hex }]} />
                <Text style={styles.swatchLabel}>
                  {s.name} · {s.hex.toUpperCase()}
                </Text>
              </View>
            ))}
        </View>
        {model.palette.notes ? <Text style={styles.paragraph}>{model.palette.notes}</Text> : null}

        {logoImages.length ? (
          <View>
            <Text style={[styles.sectionTitle, { color: primary }]}>Logotipo</Text>
            <View style={styles.imageGrid}>
              {logoImages.map((src, i) => (
                <Image key={`logo-${i}`} src={src} style={styles.thumb} />
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.footer}>Identidade visual · {model.projectTitle}</Text>
      </Page>

      {moodboardImages.length ? (
        <Page size="A4" style={styles.page}>
          <Text style={[styles.sectionTitle, { color: primary, marginTop: 0 }]}>Moodboard</Text>
          <View style={styles.imageGrid}>
            {moodboardImages.map((src, i) => (
              <Image key={`mb-${i}`} src={src} style={styles.thumb} />
            ))}
          </View>
          <Text style={styles.footer}>Referências visuais</Text>
        </Page>
      ) : null}
    </Document>
  );
}
