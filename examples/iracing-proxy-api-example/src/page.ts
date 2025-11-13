export function page(body: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>iRacing OAuth Example</title>
    <style>
      body { font-family: sans-serif; margin: 2rem; }
      a { display: inline-block; margin-top: 1rem; }
    </style>
  </head>
  <body>
    ${body}
  </body>
</html>`;
}
