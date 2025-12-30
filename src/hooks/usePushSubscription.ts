
import { useState, useEffect } from 'react';

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const usePushSubscription = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            // register service worker
            navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none',
            }).then(reg => {
                console.log('Service Worker registered', reg);
                setRegistration(reg);
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        setSubscription(sub);
                        setIsSubscribed(true);
                    }
                });
            });
        }
    }, []);

    const subscribeToPush = async () => {
        if (!registration) return;
        try {
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
            });
            setSubscription(sub);
            setIsSubscribed(true);

            // Send subscription to backend
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sub),
            });
            console.log('Web Push Subscribed!');
        } catch (error) {
            console.error('Failed to subscribe to Push', error);
        }
    };

    const unsubscribeFromPush = async () => {
        if (!subscription) return;
        await subscription.unsubscribe();
        setIsSubscribed(false);
        setSubscription(null);
        // Backend removal could be added here
        console.log('Web Push Unsubscribed!');
    };


    return { isSubscribed, subscribeToPush, unsubscribeFromPush, subscription };
};
