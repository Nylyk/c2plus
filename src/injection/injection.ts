import { Profile, MatchUpdateMessage, fetchMeProfile } from './api';
import { setWebSocketMessageCallback } from './callbacks';
import { render } from 'solid-js/web';
import { SidebarRoot } from './sidebar/SidebarRoot';
import { db } from './db';
import { loadOrCreateUser, updateUserFromProfile } from './user';

let me: Profile | undefined;
fetchMeProfile().then(profile => {
    me = profile;
    updateUserFromProfile(profile);
});

let mounted = false;

setWebSocketMessageCallback((msg) => {
    if (!mounted) {
        const sidebarMount = document.querySelector('aside > div:nth-child(2) > div > div') as HTMLElement | null;
        if (sidebarMount) {
            sidebarMount.textContent = '';
            sidebarMount.style.padding = '0';
            render(SidebarRoot, sidebarMount);
            mounted = true;
        }
    }

    if (!msg.includes('matchUpdate') || !me) {
        return Promise.resolve();
    }

    while (!msg.startsWith('[')) {
        msg = msg.substring(1);
    }

    const message = JSON.parse(msg)[1] as MatchUpdateMessage;
    if (message.inQueue || message.match.closure.closed) {
        return Promise.resolve();
    }

    let profile = message.match.conversation.participants[0].profile;
    if (profile.id === me.id) {
        profile = message.match.conversation.participants[1].profile;
    }

    return loadOrCreateUser(profile)
        .then((user) => {
            if (user.matches[user.matches.length-1] !== message.match.conversation.createdAt) {
                user.matches.push(message.match.conversation.createdAt);
            }

            user.commonInterests = message.match.commonInterests;
            const newCommonInterests = user.commonInterests.filter(i => user.interests.indexOf(i) === -1);
            user.interests.push(...newCommonInterests);

            return db.users.put(user);
        });
});
