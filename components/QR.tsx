/** @jsxImportSource @hono/hono/jsx */
import { type FC } from "@hono/hono/jsx";
import { qrcode } from "@libs/qrcode";

const QR: FC<{ url: URL }> = ({ url }) => {
  const svg = qrcode(url, { output: "svg" });
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default QR;
