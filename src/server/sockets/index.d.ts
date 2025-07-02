import type { Player, User } from "@root/index";

declare module 'http' {
    interface IncomingMessage {
        user?: User;
    }
}
