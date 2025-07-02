import type { User, UserID, UserList } from "@root/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface UsersState {
    items: UserList;
    currentID: UserID|null;
}

const initialState: UsersState = {
    items: {},
    currentID: null,
};

export const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        addUser(state, action: PayloadAction<User>) {
            const user = action.payload;
            state.items[user.id] = user;
        },

        removeGame(state, action: PayloadAction<UserID>) {
            delete state.items[action.payload];
        },
    },
});

export const usersActions = usersSlice.actions;

export const usersReducer = usersSlice.reducer;
