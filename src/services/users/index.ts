import { DataSource } from "typeorm";
import * as queries from "../../postgres/queries";
import { UsersListComponent } from "../../components/pages/users/users_list";
import { ViewUserComponent } from "../../components/pages/users/view_user";
import { logger } from "../..";

export const listUsers = async (dataSource: DataSource) => {
  const users = await queries.getAllUsers(dataSource);
  return UsersListComponent(users);
};

export const getUser = async (dataSource: DataSource, userId: number) => {
  const user = await queries.getUserById(dataSource, userId);
  if (user === null) {
    const message = `Failed to get user with id [${userId}]`;
    logger.error(message);
    throw new Error(message);
  } else {
    logger.trace(`Found user with ID [${userId}]`);
    return ViewUserComponent(user);
  }
};

export const updateUser = async (dataSource: DataSource, userId: number) => {};
