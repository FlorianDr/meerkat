/** @jsxImportSource @hono/hono/jsx */
import { Hono } from "@hono/hono";
import Document from "../components/Document.tsx";

const app = new Hono();

app.get("/", (c) => {
  return c.html(
    <Document>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2rem",
          fontFamily: "system-ui, -apple-system, sans-serif",
          maxWidth: "800px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1>Meerkat - privacy preserving conference engagement</h1>
        <img
          src="https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/global/logo.png"
          alt="Meerkat"
        />
        <p>
          Meerkat is a platform for engaging conferences with a focus on
          privacy.
        </p>
        <div>
          <h2>Want to learn more?</h2>
          <p>
            Reach out to us on Telegram at{" "}
            <a href="https://t.me/bullishonblockchain">
              @bullishonblockchain
            </a>
          </p>
        </div>
      </div>
    </Document>,
  );
});

export default app;
