import db from "./db";

export const getTransaction = () => {
    const transaction = db.transaction();
    return transaction;
};
