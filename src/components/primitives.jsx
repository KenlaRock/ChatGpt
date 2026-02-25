import { Radio, CheckCircle2 } from "lucide-react";
import { THEME, styles } from "../theme";

export const Card = ({ children, style }) => <div style={{ ...styles.card, ...style }}>{children}</div>;

export const Pill = ({ icon: Icon, title, children }) => (
  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
    <div
      style={{
        marginTop: 2,
        borderRadius: 12,
        border: `1px solid ${THEME.border}`,
        background: THEME.panel2,
        padding: 8,
      }}
    >
      <Icon size={20} color={THEME.text2} />
    </div>
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.4,
          color: THEME.text2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 13,
          lineHeight: 1.55,
          color: THEME.text3,
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

export const SectionTitle = ({ kicker, title, subtitle }) => (
  <div>
    {kicker ? (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 999,
          border: `1px solid ${THEME.border}`,
          background: THEME.panel2,
          padding: "6px 12px",
          fontSize: 11,
          letterSpacing: "0.2em",
          color: THEME.text3,
          marginBottom: 10,
        }}
      >
        <Radio size={14} color={THEME.text3} />
        {kicker}
      </div>
    ) : null}

    <div
      style={{
        fontSize: 34,
        fontWeight: 700,
        letterSpacing: -0.4,
        color: THEME.text,
      }}
    >
      {title}
    </div>

    {subtitle ? (
      <div
        style={{
          marginTop: 12,
          maxWidth: 880,
          fontSize: 16,
          lineHeight: 1.65,
          color: THEME.text3,
        }}
      >
        {subtitle}
      </div>
    ) : null}
  </div>
);

export const Checklist = ({ items }) => (
  <div style={{ display: "grid", gap: 12 }}>
    {items.map((x, i) => (
      <div
        key={i}
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          borderRadius: 16,
          border: `1px solid ${THEME.border}`,
          background: THEME.panel2,
          padding: 16,
        }}
      >
        <CheckCircle2 size={20} color={THEME.text2} style={{ marginTop: 2 }} />
        <div style={{ fontSize: 13, lineHeight: 1.6, color: THEME.text3 }}>{x}</div>
      </div>
    ))}
  </div>
);

export const TimelineRow = ({ week, purpose, items, microcopy }) => (
  <Card style={{ padding: 20 }}>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        justifyContent: "space-between",
      }}
    >
      <div style={{ minWidth: 190 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: THEME.text4 }}>{week}</div>
        <div
          style={{
            marginTop: 6,
            fontSize: 18,
            fontWeight: 700,
            color: THEME.text,
          }}
        >
          {purpose}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 260 }}>
        <ul
          style={{
            margin: 0,
            paddingLeft: 0,
            listStyle: "none",
            display: "grid",
            gap: 10,
          }}
        >
          {items.map((x, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: 10,
                color: THEME.text3,
                fontSize: 13,
              }}
            >
              <span
                style={{
                  marginTop: 7,
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.28)",
                  flex: "0 0 auto",
                }}
              />
              <span style={{ lineHeight: 1.6 }}>{x}</span>
            </li>
          ))}
        </ul>

        {microcopy ? (
          <div
            style={{
              marginTop: 14,
              borderRadius: 12,
              border: `1px solid ${THEME.border}`,
              background: THEME.panel2,
              padding: "10px 14px",
              fontSize: 13,
              color: THEME.text2,
            }}
          >
            <span style={{ color: THEME.text4 }}>Exempeltext: </span>
            <span style={{ fontWeight: 700, letterSpacing: 0.6 }}>{microcopy}</span>
          </div>
        ) : null}
      </div>
    </div>
  </Card>
);

export const SlideBody = ({ slide, img }) => (
  <div style={styles.slideFrame}>
    <SectionTitle kicker={slide.kicker} title={slide.title} subtitle={slide.subtitle} />
    {slide.body(img)}
  </div>
);
