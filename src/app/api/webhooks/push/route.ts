
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import webPush from 'web-push';

// Admin client to bypass RLS for fetching subscriptions
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webPush.setVapidDetails(
    `mailto:${process.env.VAPID_Subject || 'test@example.com'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const record = body.record; // Supabase webhook payload structure

        if (!record) {
            return NextResponse.json({ message: 'No record found' }, { status: 400 });
        }

        const toUserId = record.to_user_id;
        const notificationId = record.id;

        // Fetch the user's subscriptions
        const { data: subscriptions, error } = await supabaseAdmin
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', toUserId);

        if (error || !subscriptions || subscriptions.length === 0) {
            console.log(`No subscriptions found for user ${toUserId}`);
            console.log('Query Error:', error);
            console.log('Subscriptions:', subscriptions);
            return NextResponse.json({ message: 'No subscriptions' });
        }

        // Fetch related task/user data to build the notification message
        // Ideally the webhook payload has enough info, or we can fetch it here.
        // For simplicity, let's fetch the task title and sender name.
        const { data: notificationData } = await supabaseAdmin
            .from('notifications')
            .select(`
                *,
                tasks(title),
                users!notifications_from_user_id_fkey(name, icon)
             `)
            .eq('id', notificationId)
            .single();

        if (!notificationData) {
            return NextResponse.json({ message: 'Notification data not found' });
        }

        const senderName = notificationData.users?.name || 'Someone';
        const senderIcon = notificationData.users?.icon || '/default_icon.svg';
        const taskTitle = notificationData.tasks?.title || 'a task';

        let title = "Task App Notification";
        let message = "";

        if (record.action_type === 'TASK_ASSIGNED') {
            title = "Task Assigned";
            message = `${senderName} assigned you to "${taskTitle}"`;
        } else if (record.action_type === 'CHAT_MENTION') {
            // Fetch the chat message content
            // Assuming the notification is triggered by the latest chat from this user in this task
            const { data: chatData } = await supabaseAdmin
                .from('chats')
                .select('message')
                .eq('task_id', record.task_id)
                .eq('user_id', record.from_user_id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            const chatContent = chatData?.message || "mentioned you";
            // Truncate if too long (e.g. 50 chars)
            const truncatedContent = chatContent.length > 50 ? chatContent.substring(0, 50) + '...' : chatContent;

            title = taskTitle;
            message = `${senderName}: ${truncatedContent}`;
        } else {
            message = `${senderName} updated "${taskTitle}"`;
        }


        const url = `/detail/${record.task_id}`;

        const payload = JSON.stringify({
            title: title,
            body: message,
            url: url,
            icon: senderIcon
        });

        // Send to all subscriptions for this user
        const promises = subscriptions.map(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };
            return webPush.sendNotification(pushSubscription, payload)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((err: any) => {
                    console.error('Error sending push:', err);
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        // Expired subscription, delete from DB
                        supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id).then();
                    }
                });
        });

        await Promise.all(promises);

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error('Webhook error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
