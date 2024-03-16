export interface TestUser {
  username: string;
  password: string;
}

export const testUser: TestUser = {
  username: "normalUser",
  password: "password",
};

export const testAdminUser: TestUser = {
  username: "admin",
  password: "password",
};
