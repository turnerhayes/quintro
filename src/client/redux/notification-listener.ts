import { createListenerMiddleware } from "@reduxjs/toolkit";
import { notifyMarblePlaced } from "@/client/redux/notification-actions";
import { sendNotification, type SendNotificationParams } from "@/client/notify.client";
import type { RootState } from "@/client/redux/reducer";
import { gamesApi } from "@/client/api/games";
import { getCurrentPlayer } from "@/client/redux/selectors/game";
import { getNotificationsEnabled } from "@/client/redux/selectors/settings";


const notificationListener = createListenerMiddleware<RootState>();

notificationListener.startListening({
    actionCreator: notifyMarblePlaced,
    effect(action, listenerApi) {
        const state = listenerApi.getState();
        const notificationsEnabled = getNotificationsEnabled(state);

        if (!notificationsEnabled) {
            return;
        }

        const { gameName } = action.payload;

        const {data: game} = gamesApi.endpoints.getGame.select({gameName})(state);

        if (!game) {
            return;
        }

        const currentPlayer = getCurrentPlayer(game);

        if ("isMe" in currentPlayer) {
            const onClick: SendNotificationParams["onClick"] = (close) => {
                close();
            };
    
            sendNotification({
                content: "It's your turn!",
                onClick,
            });
        }
    },
});

export default notificationListener.middleware;
