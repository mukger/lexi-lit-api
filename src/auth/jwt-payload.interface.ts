import { TokenTypes } from "src/data/token-types";
import { UsersRoles } from "src/data/users-roles";

export interface JwtPayload {
    login: string;
    role: UsersRoles;
    type: TokenTypes;
}