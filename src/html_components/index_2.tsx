export const indexPage = (
    <html data-theme="dark" lang="en">
        <head>
            <title>Hello World</title>
            <link rel="stylesheet" href="http://localhost:3000/public/pico.min.css" />
            <script src="http://localhost:3000/public/htmx.min.js"></script>
        </head>
        <body>
            <main class="container">
                <article>
                    <h1>
                        Hello Nigel
                    </h1>
                    <div id="htmx-result" />
                </article>
                <button hx-post="/name" hx-target="#htmx-result">Test HTMX</button>
            </main>
        </body>
    </html>
);
