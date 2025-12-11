export const scalarTemplate = `
<!doctype html>
<html>
  <head>
    <title>__TITLE__</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>

  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      Scalar.createApiReference('#app', {
        content: __SPEC__,
        hideClientButton: true,
        showToolbar: "never"
      })
    </script>
  </body>
</html>
`;
