export interface User {
    id: string;
    username: string;
    name: {
        display: string;
    };
    provider: string;
}