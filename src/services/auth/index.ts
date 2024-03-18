import { DataSource } from "typeorm";
import * as queries from "../../postgres/queries";
import { UsersEntity } from "../../postgres/entities";

/**
 * Processes a login request.
 * This service function is unique in because some of the business logic required to complete
 * it's functionality has been leaked to the auth routes handler. An explanation for the reasons
 * why can be found there.
 */
export const processLoginRequest = async (
    dataSource: DataSource,
    username: string,
    possiblePassword: string
): Promise<{ errorMessage: string; userEntity?: UsersEntity }> => {
    const user = await queries.getUserByUsernameWithCredentials(
        dataSource,
        username
    );

    if (user === null) {
        // return unknown user error message back to the UI
        return {
            errorMessage: `No user exists with username ${username}. Please try again.`,
        };
    }

    if (!user.is_active) {
        return {
            errorMessage:
                "This account is currently inactive. Contact administrator.",
        };
    }

    const isMatch = await Bun.password.verify(
        possiblePassword,
        user.user_credentials.encrypted_password
    );

    if (isMatch === false) {
        // return incorrect credentials message back to the user
        return {
            errorMessage: `Invalid password entered for user ${username}.`,
        };
    }

    return { errorMessage: "", userEntity: user };
};

/**
 * For now, anyone can create a user via the API endpoint :-)
 * Of course this will be purged once authentication is tested more, this just makes testing
 * much more easier.
 * TODO: Only Admin accounts should be able to create new users.
 *
 * Minor chicken/egg problem here as well, once a fresh instance of the application is started, how
 * should we seed the admin user? I'm thinking just use admin/pass combination and show a warning
 * to update admin credentials as soon as possible.
 */
export const processCreateUserRequest = async (
    dataSource: DataSource,
    newUserUsername: string,
    newUserPassword: string
) => {
    const initializeNewUserResult = await queries.createNewUser(
        dataSource,
        newUserUsername
    );
    const hashedPassword = await Bun.password.hash(newUserPassword);
    await queries.createUserCredentials(
        dataSource,
        initializeNewUserResult.identifiers[0].id,
        hashedPassword
    );
    return "User created";
};
