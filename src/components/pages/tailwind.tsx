import { getConfig } from "../..";

export const TailWindComponent = () => {
    return (
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <script src={`${getConfig().baseUrl}/public/tailwind.js`}></script>
            </head>
            <body>
                <div class="flex h-screen">
                    <header class="m-auto">
                        <p class="text-2xl underline underline-offset-8 font-['Menlo'] 
          hover:underline-offset-4 hover:text-3xl hover:border-red-500 
           hover:border-4 hover:p-4 hover:cursor-pointer">
                            wagwann
                        </p>
                    </header>
                </div>
            </body>
        </html>
    );
}
