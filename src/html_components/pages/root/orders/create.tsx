export const CreateOrderSection = () => {
    return (
        <div>
            <h6>Create Order</h6>
            <div class="grid">
                <div>
                    <button role="button" class="outline" hx-get="/orders/list" hx-target="#orders-section">Back</button>
                </div>
                <div />
                <div />
                <div />
            </div>
        </div>
    );
};
