/** @jsxImportSource @hono/hono/jsx */
import { Hono } from "@hono/hono";
import { getEventByUID } from "../models/events.ts";
import Layout from "./components/Layout.tsx";
import QR from "./components/QR.tsx";
import { typeid } from "typeid-js";
import env from "../env.ts";
import { getConferenceById } from "../models/conferences.ts";
import { getZupassAddPCDURL } from "../zupass.ts";

const app = new Hono();

app.get("/:suffix", async (c) => {
  const suffix = c.req.param("suffix");
  const typeId = typeid("event", suffix);
  const event = await getEventByUID(typeId.toString());

  if (!event) {
    c.status(404);
    return c.json({ error: `Event ${suffix} not found` });
  }

  const conference = await getConferenceById(event.conferenceId);

  if (!conference) {
    c.status(404);
    return c.json({ error: `Conference ${event.conferenceId} not found` });
  }

  const base = c.req.header("origin") ?? env.base;
  const url = await getZupassAddPCDURL({
    conference,
    event,
    redirectURL: base + "/thank-you",
  });

  return c.html(
    <Layout>
      <h1>{event.title}</h1>
      <div style={{ height: 300, width: 300 }}>
        <QR url={url} />
      </div>
      <span>Scan above QR code to join the discussion</span>
    </Layout>,
  );
});

export default app;
