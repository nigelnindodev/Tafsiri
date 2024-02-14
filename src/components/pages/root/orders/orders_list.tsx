import { OrderEntity } from "../../../../postgres/entities";

export const ordersList = (data: OrderEntity[]) => {
    return (
        <div>
            <h6>Orders List</h6>
            <table>
                <thead>
                    <tr>
                        <th>First</th>
                        <th>Second,</th>
                    </tr>
                </thead>
            </table>
            <tbody>
                {data.map(item => {
                    return (
                        <tr>
                            <td>First</td>
                            <td>Second</td>
                        </tr>
                    )
                })}
            </tbody>
        </div>
    )
};
