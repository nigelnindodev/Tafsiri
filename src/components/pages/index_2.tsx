export const IndexPage = () => {
    return (
        <html data-theme="dark" lang="en">
            <head>
                <title>Epic Hideout</title>
                <link rel="stylesheet" href="http://localhost:3000/public/pico.min.css" />
                <link rel="stylesheet" href="http://localhost:3000/public/tailwind.css" />
                <link rel="stylesheet" href="http://localhost:3000/public/custom.css" />
                <script src="http://localhost:3000/public/htmx.min.js" />
                <script src="http://localhost:3000/public/theme_switcher.js" />
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
                    <div id="main-view" hx-get="/inventory" hx-trigger="load" />
                </main>
            </body>
        </html>
    );
}; 
