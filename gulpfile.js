const fs = require("fs");
const path = require("path");
const lodash = require("lodash");
const { minify } = require("html-minifier");

const distPath = path.join(process.cwd(), "dist");
function clean(cb) {
  if (fs.existsSync(distPath)) {
    for (const file of fs.readdirSync(distPath)) {
      fs.unlinkSync(path.join(process.cwd(), "dist", file));
    }
  }
  cb();
}

async function compileHTML(cb) {
  const distPath = path.join(process.cwd(), "dist");
  const templateHTML = minify(fs.readFileSync("./index.html", "utf-8"), {
    removeComments: true,
    removeCommentsFromCDATA: true,
    removeCDATASectionsFromCDATA: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeRedundantAttributes: true,

    minifyJS: true,
    minifyCSS: true,
  });
  const jsFile = fs.readdirSync(distPath).find((f) => f.endsWith("js"));
  if (!jsFile) throw new Error("Failed to compile. unable to find js script");
  const content = fs.readFileSync(
    path.join(process.cwd(), "dist", jsFile),
    "utf-8"
  );
  const script = templateHTML.replace(
    "</body>",
    `<script type="application/javascript">#JS_INJECT_CODE</script></body>`
  );
  const genTemplate = script.replace(/#JS_INJECT_CODE/g, content);
  clean(() => {});
  fs.writeFileSync(path.join(process.cwd(), "dist", "index.html"), genTemplate);
  cb();
}

function ex(string) {
  const index = string.lastIndexOf(".");
  if (index === -1) {
    return { text: string, ex: "" };
  } else {
    return { text: string.slice(0, index), ex: string.slice(index + 1) };
  }
}

const serializeAssets = (cb) => {
  const assetsPath = path.join(process.cwd(), "assets");
  const assetsGenPath = path.join(process.cwd(), "src", "assets.ts");
  const assets = fs.readdirSync(assetsPath);
  const assetsBuilder = {};
  for (const asset of assets) {
    const readFile = fs.readFileSync(
      path.join(process.cwd(), "assets", asset),
      "base64"
    );
    const data = ex(asset);
    assetsBuilder[lodash.camelCase(data.text)] = {
      ...data,
      data: readFile,
    };
  }
  const code = [
    `export interface Asset {`,
    `    ex: string;`,
    `    text: string;`,
    `    data: string;`,
    `}`,
    `export interface Assets {`,
    `${Object.keys(assetsBuilder)
      .map((e) => `    ${e}: Asset;`)
      .join("\n")}`,
    `}`,
    `export const assets = JSON.parse(\`${JSON.stringify(
      assetsBuilder,
      undefined,
      2
    )}\`) as Assets;`,
  ].join("\n");

  fs.writeFileSync(assetsGenPath, code);
  cb();
};

// Thanks TC for providing this HTML compiler

module.exports = {
  clean,
  default: serializeAssets,
  compileHTML,
};
