import { HtmxTargets } from "../../common/constants";

export const orderCreateSuccess = () => {
    return (
        <div
            hx-get="/orders/list"
            hx-target={`#${HtmxTargets.ORDERS_SECTION}`}
            hx-trigger="load delay:2s"
        >
            <ins>Order Created successfully.</ins>
        </div>
    );
};
