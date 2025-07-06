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
