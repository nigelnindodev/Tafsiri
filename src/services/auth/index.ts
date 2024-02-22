import { DataSource } from "typeorm";
import { getUserByUsernameWithCredentials } from "../../postgres/queries";

export const processLoginRequest = async (dataSource: DataSource, username: string, possiblePassword: string): Promise<{ success: boolean; errorMessage?: string | undefined; }> => {
	const user = await getUserByUsernameWithCredentials(dataSource, username);

	if (user === null) {
		// return unknown user error message back to the UI
		return { success: false, errorMessage: "Unknown user" };
	}

	const isMatch = await Bun.password.verify(possiblePassword, user.user_credentials.encrypted_password);

	if (isMatch === false) {
		// return incorrect credentials message back to the user
		return { success: false, errorMessage: "Incorrect Credentials" };
	}

	return { success: true };
};
