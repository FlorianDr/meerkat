/** @jsxImportSource @hono/hono/jsx */
import type { FC } from "@hono/hono/jsx";

const Layout: FC = ({ children }) => {
  return (
    <html>
      <head>
        <title>Meerkat</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
};

export default Layout;
