import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import type { UserID, UserList } from "@root/types";

export const getAllUsers = (state: RootState) => state.users.items;

export const getCurrentUser = createSelector(
    [
        getAllUsers,
        (state: RootState) => state.users.currentID,
    ],
    (users, currentID) => {
        if (currentID === null) {
            return null;
        }

        return users[currentID];
    }
);

// export const getUsersByIDs = createSelector(
//     [
//         getAllUsers,
//         (_, {userIDs}: {userIDs: UserID[];}) => userIDs
//     ],
//     (users, userIDs) => ({
//         ...(Object.keys(users).filter((id) => userIDs.includes(id))).reduce(
//             (userList, userID: UserID) => {
//                 userList[userID] = users[userID];
//                 return userList;
//             },
//             {} as UserList
//         )
//     })
// );
