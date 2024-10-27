/** @jsxImportSource @hono/hono/jsx */
import type { FC } from "@hono/hono/jsx";

const Document: FC = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/index.css" />
        <title>Meerkat - engaging conferences</title>
        <script
          src="https://js.sentry-cdn.com/2c581370c40330948e8288d15ada6a89.min.js"
          crossorigin="anonymous"
        >
        </script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
};

export default Document;
