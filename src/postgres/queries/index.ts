import { DataSource, InsertResult } from "typeorm"
import { InventoryEntity } from "../entities";

export const insertInventoryItem = async (
  dataSource: DataSource,
  data: {
    name: string;
    price: number;
  }
): Promise<InsertResult> => {
  return await dataSource.createQueryBuilder()
  .insert()
  .into(InventoryEntity)
  .values({
    name: data.name,
    price: data.price,
    active: true // one creation an inventory item is automatically active
  })
  .execute();
};
