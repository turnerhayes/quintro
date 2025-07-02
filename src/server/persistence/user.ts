import { User, UserID } from "@root/types/index";
import db from "@server/persistence/db";
import { User as UserRow } from "@server/persistence/types";


const SELECT_COLUMNS: ReadonlyArray<keyof UserRow> = [
    "id",
    "email",
    "display_name",
];

const resultToUser = (row: Pick<UserRow, typeof SELECT_COLUMNS[number]>): User => ({
    id: row.id,
    name: {
        display: row.display_name,
    },
});

export const getUsers = async (
    {
        ids,
    }: {
        ids: UserID[];
    }
): Promise<{
    [id: UserID]: User;
}> => {
    if (ids.length === 0) {
        return {};
    }

    const results = await db.selectFrom("users")
        .select(SELECT_COLUMNS)
        .where("id", "in", ids)
        .execute();
    
    if (results == null || results.length == 0) {
        return {};
    }

    return results.reduce(
        (users, result) => {
            const user = resultToUser(result);
            users[user.id] = user;
            return users;
        },
        {} as {[id: UserID]: User}
    );
}

export const getUser = async (
    {
        id,
    }: {
        id: number;
    }
) => {
    const result = await db.selectFrom("users")
        .select(SELECT_COLUMNS)
        .where("id", "=", id)
        .executeTakeFirst();
    
    if (!result) {
        return null;
    }

    return resultToUser(result);
};
