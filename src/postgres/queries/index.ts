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
    name: data.name.toUpperCase(),
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
    .orderBy({"inventory.id": "ASC"})
    .getMany();
  return data;
};

/**
 * Possibility of SQL injection here?
 * WOuld also prefer to use Postgres' similarity function instead of a LIKE query here
 */
export const getInventoryItemsByName= async(
  dataSource: DataSource,
  name: string)
: Promise<InventoryEntity[]> => {
  try {
    const data: InventoryEntity[] = await dataSource.createQueryBuilder()
      .select(TableNames.INVENTORY)
      .from(InventoryEntity, TableNames.INVENTORY)
      //.where("similarity(name, :name) > 0.2", {name: name.toUpperCase()})
      .where(`name like '%${name.toUpperCase()}%'`)
      .andWhere("active = :state", {state: true})
      .orderBy({"inventory.id": "ASC"})
      .getMany()
    return data;
  } catch(e) {
    console.error(e);
    return [];
  }

};
