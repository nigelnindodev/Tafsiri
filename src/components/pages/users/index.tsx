import { HtmxTargets } from "../../common/constants";

export const UsersPage = () => {
    return (
        <article>
            <header>
                <h1>Users</h1>
            </header>
            <body>
                <div
                    id={HtmxTargets.USERS_SECTION}
                    hx-get="/users/list"
                    hx-trigger="load"
                />
            </body>
        </article>
    );
};
