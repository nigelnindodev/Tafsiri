import { HtmxTargets } from "../../common/constants";

export const UserUpdateResultComponent = () => {
    return (
        <div
            hx-get="/users"
            hx-target={`#${HtmxTargets.USERS_SECTION}`}
            hx-trigger="load delay:2s"
        >
            <ins>User updated.</ins>
        </div>
    );
};
