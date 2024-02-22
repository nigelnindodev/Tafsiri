export const LoginPage = () => {
    return (
        <html data-theme="dark" lang="en">
            <head>
                <title>Login</title>
                <link rel="stylesheet" href="http://localhost:3000/public/pico.min.css" />
                <link rel="stylesheet" href="http://localhost:3000/public/tailwind.css" />
                <link rel="stylesheet" href="http://localhost:3000/public/custom.css" />
                <script src="http://localhost:3000/public/htmx.min.js" />
                <script src="http://localhost:3000/public/theme_switcher.js" />
            </head>
            <body>
                <main class="container">
                    <form>
                        <label for="username">Email address</label>
                        <input type="username" id="username" name="username" placeholder="Username" required />
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="Password" required />
                    </form>
                </main>
            </body>
        </html>
    );
};
