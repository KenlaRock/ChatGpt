import { Card, Checklist, TimelineRow } from "./primitives";
import { THEME } from "../theme";

function ImageBlock({ block, media }) {
  const image = media.find((item) => item.id === block.props.imageId);
  const fitMode = block.props.fit === "cover" ? "cover" : "contain";
  const aspect = fitMode === "cover" ? "56.25%" : "62%";

  return (
    <Card style={{ padding: 14 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.2em", color: THEME.text4 }}>{block.props.heading || "BILD"}</div>
      <div
        style={{
          marginTop: 10,
          width: "100%",
          borderRadius: 14,
          border: `1px solid ${THEME.border}`,
          overflow: "hidden",
          background: THEME.panel2,
          position: "relative",
        }}
      >
        <div style={{ paddingTop: aspect }} />
        {image ? (
          <img
            src={image.dataUrl}
            alt={block.props.alt || image.alt || image.fileName}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: fitMode,
              objectPosition: "center",
              background: "rgba(0,0,0,0.25)",
            }}
          />
        ) : (
          <div style={{ fontSize: 12, color: THEME.text4, display: "grid", placeItems: "center", position: "absolute", inset: 0, padding: 16, textAlign: "center" }}>
            Ingen bild vald ännu.
          </div>
        )}
      </div>
      {block.props.caption ? <div style={{ marginTop: 8, fontSize: 11, color: THEME.text4 }}>{block.props.caption}</div> : null}
    </Card>
  );
}

export function BlockRenderer({ block, media }) {
  switch (block.type) {
    case "text":
      return (
        <Card style={{ padding: 20 }}>
          {block.props.heading ? <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text2 }}>{block.props.heading}</div> : null}
          <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: THEME.text3 }}>{block.props.body}</div>
        </Card>
      );
    case "checklist":
      return (
        <Card style={{ padding: 20 }}>
          {block.props.heading ? <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 700, color: THEME.text2 }}>{block.props.heading}</div> : null}
          <Checklist items={block.props.items || []} />
        </Card>
      );
    case "timeline":
      return <TimelineRow {...block.props} />;
    case "quote":
      return (
        <Card style={{ padding: 24 }}>
          <div style={{ fontSize: 21, fontWeight: 800, color: THEME.text }}>&ldquo;{block.props.text}&rdquo;</div>
          {block.props.subtext ? <div style={{ marginTop: 10, fontSize: 12, color: THEME.text4 }}>{block.props.subtext}</div> : null}
        </Card>
      );
    case "image":
      return <ImageBlock block={block} media={media} />;
    default:
      return (
        <Card style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: THEME.text4 }}>Okänd blocktyp: {block.type}</div>
        </Card>
      );
  }
}
