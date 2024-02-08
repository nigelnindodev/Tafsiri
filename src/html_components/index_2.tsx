export const newIndexPage = (
    <html data-theme="dark" lang="en">
        <head>
            <title>Hello World</title>
            <link rel="stylesheet" href="http://localhost:3000/public/pico.min.css" />
            <script src="http://localhost:3000/public/htmx.min.js"></script>
        </head>
        <body>
            <main class="container">
                <nav>
                    <ul>
                        <li>Epic Hideout</li>
                    </ul>
                    <ul>
                        <li><a hx-get="/orders" hx-target="#main-view">Orders</a></li>
                        <li><a hx-get="/payments" hx-target="#main-view">Payments</a></li>
                        <li><a hx-get="/inventory" hx-target="#main-view">Inventory</a></li>
                    </ul>
                </nav>
                <div id="main-view" />
            </main>
        </body>
    </html>
);
