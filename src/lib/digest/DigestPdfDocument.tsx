import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

/**
 * Default layout for the daily digest PDF — brand colors, one section per
 * topic. Deliberately isolated in its own component: swapping in a specific
 * visual "format" later is a template change here, not a pipeline rewrite.
 */

const BLUE = "#0037D2";
const CREAM = "#F2ECDD";
const INK = "#111111";

const styles = StyleSheet.create({
  page: { backgroundColor: "#FFFFFF", padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { backgroundColor: BLUE, marginHorizontal: -40, marginTop: -40, padding: 32, marginBottom: 28 },
  headerEyebrow: { color: "#C1FF3B", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: 700 },
  headerDate: { color: "rgba(255,255,255,0.7)", fontSize: 10, marginTop: 4 },
  topicSection: { marginBottom: 22 },
  topicHeading: { fontSize: 14, fontWeight: 700, color: BLUE, marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${CREAM}` },
  bullet: { flexDirection: "row", marginBottom: 5 },
  bulletDot: { width: 12, color: BLUE, fontWeight: 700 },
  bulletText: { flex: 1, color: INK, lineHeight: 1.4 },
  emptyNote: { color: "#777777", fontSize: 10, fontStyle: "italic" },
  footer: { marginTop: 24, paddingTop: 16, borderTop: `1px solid ${CREAM}`, color: "#999999", fontSize: 8, textAlign: "center" },
});

/** Splits AI output ("- item one\n- item two") into individual bullet lines. */
function parseBullets(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export interface DigestTopicSection {
  title: string;
  content: string | null;
}

export function DigestPdfDocument({
  memberEmail,
  dateLabel,
  sections,
}: {
  memberEmail: string;
  dateLabel: string;
  sections: DigestTopicSection[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>Successbrew Daily Brief</Text>
          <Text style={styles.headerTitle}>Your topics, today</Text>
          <Text style={styles.headerDate}>{dateLabel} · {memberEmail}</Text>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.topicSection}>
            <Text style={styles.topicHeading}>{section.title}</Text>
            {section.content ? (
              parseBullets(section.content).map((line, i) => (
                <View key={i} style={styles.bullet}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyNote}>No brief available for this topic today.</Text>
            )}
          </View>
        ))}

        <Text style={styles.footer}>Successbrew · India&apos;s Startup Ecosystem</Text>
      </Page>
    </Document>
  );
}
