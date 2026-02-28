const fs = require("fs");
console.log(
  fs
    .readFileSync(".next/server/app/docs/[[...slug]]/page.js", "utf8")
    .substring(0, 100),
);
