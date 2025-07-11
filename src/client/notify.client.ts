'use client';

export const NOTIFICATIONS_SUPPORTED = "Notification" in window;

export const needsPermission = NOTIFICATIONS_SUPPORTED && Notification.permission === "default";


let _permissionPromise: Promise<void>|undefined;

export const requestPermission = (): Promise<void> => {
    if (_permissionPromise == null) {
        _permissionPromise = new Promise<void>(
            async (resolve, reject) => {
                const result = await Notification.requestPermission();

                if (result === "denied") {
                    return reject();
                }
                else if (result === "granted") {
                    return resolve();
                }
                else {
                    return reject(null);
                }
            }
        );
    }
    
    return _permissionPromise;
};

export interface SendNotificationParams {
    content: string;
    title?: string;
    onClick?: (close: () => void) => void;
}

export const sendNotification = (
    {
        content,
        title = "Quintro",
        onClick,
    }: SendNotificationParams
) => {
    if (!NOTIFICATIONS_SUPPORTED || Notification.permission !== "granted") {
        return;
    }
    const notification = new Notification(title, {
        body: content,
    });

    const close = () => {
        notification.close();
    };

    notification.onclick = () => {
        if (onClick) {
            onClick(close);
        }
    };
};
