import { liveQuery } from 'dexie';
import { Show, createSignal } from 'solid-js';
import { setLocationChangeCallback } from '../callbacks'; 
import { Profile, fetchProfile, getUserIdFromConversation } from '../api';
import { updateUserFromProfile } from '../user';
import { UserCard } from './components/UserCard';
import { User, db } from '../db';
import { Subscription } from 'dexie';

export const SidebarRoot = () => {
    const [user, setUser] = createSignal<User | undefined>();
    const [profile, setProfile] = createSignal<Profile | undefined>();

    let userSubscription: Subscription | undefined;

    const onLocationChange = (path: string) => {
        if (userSubscription) {
            userSubscription.unsubscribe();
            userSubscription = undefined;
        }

        setUser(undefined);
        setProfile(undefined);

        const match = path.match(/^\/chat.*\/(.{24})$/i);
        if (!match) {
            return;
        }
        const conversationId = match[1];

        getUserIdFromConversation(conversationId)
            .then((userId) => {
                const userObservable = liveQuery(() => db.users.get(userId));
                userSubscription = userObservable.subscribe({
                    next: user => setUser(user),
                    error: console.error
                });
                return fetchProfile(userId);
            })
            .then((profile) => {
                setProfile(profile);
                updateUserFromProfile(profile);
            })
            .catch(console.error);
    };
    
    setLocationChangeCallback(onLocationChange);
    onLocationChange(location.pathname);

    return (
        <div>
            <Show when={user() && profile()}>
                <UserCard user={user()!} profile={profile()!} />
            </Show>
        </div>
    );
};
