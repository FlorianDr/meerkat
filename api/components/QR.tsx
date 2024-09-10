/** @jsxImportSource @hono/hono/jsx */
import { type FC } from "@hono/hono/jsx";
import { qrcode } from "@libs/qrcode";
import { Event } from "../models/events.ts";

// TODO: move to a separate file once agreed on structure
const QrFrame: FC = () => {
  return (
    <div className="qr-frame">
      <div className="qr-corner qr-corner-top-left" />
      <div className="qr-corner qr-corner-top-right" />
      <div className="qr-corner qr-corner-bottom-left" />
      <div className="qr-corner qr-corner-bottom-right" />
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
  ).replace(
    'viewBox="0 0 33 33"',
    'viewBox="0 0 33 33" style="width: 100%; height: 100%;"',
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
        <h2>{conferenceName}</h2>
        <h2>
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
