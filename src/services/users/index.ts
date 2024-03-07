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

export const toggleUserActiveState = async (
  dataSource: DataSource,
  userId: number,
) => {
  const user = await queries.getUserById(dataSource, userId);
  if (user === null) {
    const message = `Failed to get user with id [${userId}]`;
    logger.error(message);
    throw new Error(message);
  }

  if (user.is_admin) {
    const message = `Attempt to deactivate admin account with id [${userId}] denied.`;
    logger.error(message);
    throw new Error(message);
  }

  await queries.toggleUserActiveState(dataSource, userId, !user.is_active);

  logger.info(
    `Toggled user with id [${userId}] ${!user.is_active} to active state.`,
  );
  return "";
};
