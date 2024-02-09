import { DataSource, InsertResult } from "typeorm"
import { InventoryEntity } from "../entities";
import { TableNames } from "../common/constants";

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

export const getInventoryItems = async(
  dataSource: DataSource
): Promise<InventoryEntity[]> => {
  //TODO: String interpolation on a JS object key
  //const orderColumn: string = `${TableNames.INVENTORY}.id`;
  const data: InventoryEntity[] = await dataSource.createQueryBuilder()
    .select(TableNames.INVENTORY)
    .from(InventoryEntity, TableNames.INVENTORY)
    .where("active = :state", {state: true})
    .orderBy({"inventory.id": "DESC"})
    .getMany();
  return data;
};
