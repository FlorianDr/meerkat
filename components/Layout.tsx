/** @jsxImportSource @hono/hono/jsx */
import type { FC } from "@hono/hono/jsx";

const Layout: FC = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Meerkat - engaging conferences</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
};

export default Layout;
