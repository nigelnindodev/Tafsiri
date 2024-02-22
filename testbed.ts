const password = "SecurePassword";

const hash = await Bun.password.hash(password);

console.log(hash);
