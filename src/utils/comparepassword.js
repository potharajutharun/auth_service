import bcrypt from "bcrypt";
export const comparepassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
//# sourceMappingURL=comparepassword.js.map