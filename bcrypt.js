import bcrypt from "bcrypt";

console.log(await bcrypt.hash("psw", 10));
