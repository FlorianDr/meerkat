/** @jsxImportSource @hono/hono/jsx */
import { type FC } from "@hono/hono/jsx";
import { Event } from "../models/events.ts";
import { generateQRCodeSVG } from "../code.ts";

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

interface QRProps {
  url: URL;
  event: Event | null;
  conferenceName: string;
}

const QR: FC<QRProps> = ({
  url,
  event,
  conferenceName,
}) => {
  const svg = generateQRCodeSVG(url.toString());

  return (
    <div className="qr-layout">
      <header className="qr-header">
        <h2 className="header-title">{event?.title}</h2>
        <h2 className="header-title">{event?.speaker}</h2>
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
          {event?.start.toLocaleTimeString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
        </h2>
      </footer>
    </div>
  );
};

export default QR;
