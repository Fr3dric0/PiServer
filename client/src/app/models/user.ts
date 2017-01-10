
export interface User {
    firstName: string;
    lastName: string;
    email: string;
    password?: string; // Optional, because this is not required on updates of user
    oldPassword?: string;
    confirmPassword?: string;
    accessRights: string;
}