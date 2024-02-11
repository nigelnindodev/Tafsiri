import { DataSource } from "typeorm";
import { getOrders } from "../../postgres/queries";
import { InfoWrapper } from "../../html_components/common/info_wrapper";

export const listOrders = async (dataSource: DataSource) => {
	const result = await getOrders(dataSource);
	if (result.length === 0) {
		return InfoWrapper("No orders made yet. Create first order");
	} else {
		return "<div>Not implemented</div>";
	}
}
