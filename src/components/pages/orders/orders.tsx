import { HtmxTargets } from "../../common/constants"

export const ViewOrdersSection = () => {
    return (
        <div>
            <div class="grid">
                <div />
                <div />
                <div>
                    <button
                        role="button"
                        class="outline"
                        hx-get="/orders/create"
                        hx-target={`#${HtmxTargets.ORDERS_SECTION}`}
                    >
                        Create order
                    </button>
                </div>
            </div>
            <div id="orders-data" hx-get="/orders/list/all" hx-trigger="load" />
        </div>
    )
}
