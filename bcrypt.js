// import bcrypt from "bcrypt";

// console.log(await bcrypt.hash("psw", 10));

import crypto from "crypto";
console.log(crypto.randomBytes(64).toString("hex"));
