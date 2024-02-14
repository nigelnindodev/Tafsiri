export const ViewOrdersSection = () => {
    return (
        <div>
            <div class="grid">
                <div />
                <div />
                <div>
                    <button role="button" class="outline" hx-get="/orders/create" hx-target="#orders-section">Create order</button>
                </div>
            </div>
            <div id="orders-data" hx-get="/orders/list/all" hx-trigger="load" />
        </div>
    )
};
