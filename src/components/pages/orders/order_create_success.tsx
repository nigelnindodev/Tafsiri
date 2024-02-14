export const orderCreateSuccess = () => {
    return (
        <div hx-get="/orders/list" hx-target="#orders-section" hx-trigger="load delay:2s">
            <ins>Order Created successfully.</ins>
        </div>
    )
};
