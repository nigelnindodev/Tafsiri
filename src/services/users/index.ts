import { DataSource } from "typeorm";
import * as queries from "../../postgres/queries";
import { UsersListComponent } from "../../components/pages/users/users_list";

export const listUsers = async (dataSource: DataSource) => {
  const users = await queries.getAllUsers(dataSource);
  return UsersListComponent(users);
};

export const getUser = async (dataSource: DataSource, userId: number) => {};

export const updateUser = async (dataSource: DataSource, userId: number) => {};
