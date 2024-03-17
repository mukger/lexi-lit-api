import { LanguagesList } from "src/data/languages-list";
import { UsersRoles } from "src/data/users-roles";

export interface SafeProfileInfo {
    login: string;
    email: string;
    native_language: LanguagesList;
    role: UsersRoles
    registration_date: Date;
    access_token?: string;
    refresh_token?: string;
}