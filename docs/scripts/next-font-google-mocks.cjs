const path = require("node:path");

const geistLatinWoff2 = path.resolve(
  __dirname,
  "../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
);

module.exports = {
  "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap": `
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url(${geistLatinWoff2}) format('woff2');
    }
  `,
};
