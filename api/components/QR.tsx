/** @jsxImportSource @hono/hono/jsx */
import { type FC } from "@hono/hono/jsx";
import { qrcode } from "@libs/qrcode";
import { Event } from "../models/events.ts";

// TODO: move to a separate file once agreed on structure
const QrFrame: FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        pointerEvents: "none",
      }}
    >
      {/* Top-left corner */}
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "6rem",
          height: "6rem",
          borderTop: "0.6rem solid black",
          borderLeft: "0.6rem solid black",
        }}
      />
      {/* Top-right corner */}
      <div
        style={{
          position: "absolute",
          top: "0",
          right: "0",
          width: "6rem",
          height: "6rem",
          borderTop: "0.6rem solid black",
          borderRight: "0.6rem solid black",
        }}
      />
      {/* Bottom-left corner */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          width: "6rem",
          height: "6rem",
          borderBottom: "0.6rem solid black",
          borderLeft: "0.6rem solid black",
        }}
      />
      {/* Bottom-right corner */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          right: "0",
          width: "6rem",
          height: "6rem",
          borderBottom: "0.6rem solid black",
          borderRight: "0.6rem solid black",
        }}
      />
    </div>
  );
};

const QR: FC<{ url: URL; event: Event | null; conferenceName: string }> = ({
  url,
  event,
  conferenceName,
}) => {
  // set bg transparent
  const svg = qrcode(url, { output: "svg", border: 0 }).replace(
    '<rect width="100%" height="100%" fill="white"/>',
    '<rect width="100%" height="100%" fill="none"/>',
  );

  return (
    <div className="qr-layout">
      <header className="qr-header">
        <h2 className="header-title">{event?.title}</h2>
        <h2 className="header-title">Vitalik Buterin</h2>
      </header>
      <main className="qr-conentet">
        <div
          style={{
            width: "100%",
            maxWidth: "20rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <QrFrame />
      </main>
      <footer className="qr-footer">
        <h2 as="h1">{conferenceName}</h2>
        <h2 as="h1">
          {/* QUESTION: Is it today? */}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h2>
      </footer>
    </div>
  );
};

export default QR;
