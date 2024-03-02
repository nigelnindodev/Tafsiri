import { getConfig } from "../..";
import { HtmxTargets } from "../../components/common/constants"
import { ServerHxTriggerEvents } from "../../services/common/constants";

const config = getConfig();

/**
 * Root page of the application. It's responsible for:
 * - Loading application CSS markup and JS files required.
 * - Listening to global HTMX events that will replace the main "#root-div"
 * - Currenty we only have two such events:
 *   - ServerHxTriggerEvents.LOGIN_SUCCESS: Called to either load the login screen
 *   or main web app page if the user is already logged in.
 *   - ServerHxTriggerEvents.GENERAL_ERROR: Handler for 500 error messages
 */
export const RootPage = () => {
    return (
        <html data-theme="dark">
            <head>
                <title>Business Name</title>
                <link rel="stylesheet" href={`${config.baseUrl}/public/pico.min.css`} />
                <link rel="stylesheet" href={`${config.baseUrl}/public/tailwind.css`} />
                <link rel="stylesheet" href={`${config.baseUrl}/public/custom.css`} />
                <script src={`${config.baseUrl}/public/htmx.min.js`} />
                <script src={`${config.baseUrl}/public/htmx_debug.js`} />
            </head>
            <body>
                <div id={HtmxTargets.ROOT_DIV} />
                <div hx-get="/root" hx-trigger={`load, ${ServerHxTriggerEvents.LOGIN_STATUS_CHANGE} from:body`} hx-target={`#${HtmxTargets.ROOT_DIV}`} />
                <div hx-get="/todo" hx-trigger={`${ServerHxTriggerEvents.GENERAL_ERROR} from:body`} hx-target={`#${HtmxTargets.ROOT_DIV}`} />
            </body>
        </html>
    );
}
