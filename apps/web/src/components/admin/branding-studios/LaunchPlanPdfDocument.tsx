import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { LaunchPlanPdfModel } from "@ederson-agencia/shared";

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", fontSize: 11, color: "#0f172a" },
  cover: { marginBottom: 24, borderBottomWidth: 2, borderBottomColor: "#d97706", paddingBottom: 18 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 12, color: "#64748b" },
  badge: { marginTop: 10, fontSize: 11, color: "#b45309" },
  sectionTitle: { fontSize: 14, fontWeight: "bold", marginTop: 14, marginBottom: 6, color: "#b45309" },
  paragraph: { marginBottom: 5, lineHeight: 1.45 },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 },
  barTrack: { flex: 1, height: 8, backgroundColor: "#e2e8f0", borderRadius: 4 },
  barFill: { height: 8, backgroundColor: "#f59e0b", borderRadius: 4 },
  barLabel: { width: 90, fontSize: 9 },
  barValue: { width: 72, fontSize: 9, textAlign: "right", fontFamily: "Helvetica" },
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

export function LaunchPlanPdfDocument(model: LaunchPlanPdfModel) {
  const maxChart = Math.max(...model.scenariosChart.map((c) => c.value), 1);

  return (
    <Document title={`Plano de Lançamento — ${model.projectTitle}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.title}>Plano de Lançamento</Text>
          <Text style={styles.subtitle}>{model.projectTitle}</Text>
          <Text style={styles.subtitle}>Gerado em {model.generatedAt}</Text>
          <Text style={styles.badge}>Checklist FL: {model.checklistPercent}% concluído</Text>
        </View>

        {model.sections.map((sec) => (
          <View key={sec.title}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            {sec.lines.map((line, i) => (
              <Text key={`${sec.title}-${i}`} style={styles.paragraph}>
                {line}
              </Text>
            ))}
          </View>
        ))}

        {model.scenariosChart.length ? (
          <View>
            <Text style={styles.sectionTitle}>Gráfico — faturamento projetado</Text>
            {model.scenariosChart.map((bar) => (
              <View key={bar.label} style={styles.barRow}>
                <Text style={styles.barLabel}>{bar.label}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.max(8, (bar.value / maxChart) * 100)}%` }]} />
                </View>
                <Text style={styles.barValue}>R$ {bar.value.toLocaleString("pt-BR")}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.footer}>Ederson Agência · Plano confidencial · Branding · Marketing · Fórmula</Text>
      </Page>
    </Document>
  );
}
