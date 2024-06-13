import { loadUser, saveUser } from './user';
import { Profile, MatchUpdateMessage, fetchProfile, fetchMeProfile, getUserIdFromConversation, Conversation } from './api';
import { setLocationChangeCallback, setWebSocketMessageCallback } from './callbacks';
import { createUi } from './ui';

let me: Profile | undefined;
fetchMeProfile().then(profile => me = profile);

let lastMatchUpdate: MatchUpdateMessage | undefined; 

setWebSocketMessageCallback((msg) => {
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

    lastMatchUpdate = message;

    let profile = message.match.conversation.participants[0].profile;
    if (profile.id === me.id) {
        profile = message.match.conversation.participants[1].profile;
    }

    return loadUser(profile.id)
        .then((user) => {
            if (user.matches[user.matches.length-1] !== message.match.conversation.createdAt) {
                user.matches.push(message.match.conversation.createdAt);
            }

            return saveUser(user);
        });
});

let currentlyFetching = '';
let currentUi: HTMLElement | undefined;
const onLocationChange = (path: string) => {
    currentUi?.remove();

    const match = path.match(/^\/chat.*\/(.{24})$/i);
    if (!match) {
        return;
    }
    const conversationId = match[1];

    if (currentlyFetching === conversationId) {
        return;
    }
    currentlyFetching = conversationId;

    getUserIdFromConversation(conversationId)
        .then(id => Promise.all([fetchProfile(id), loadUser(id)]))
        .then(([profile, user]) => {
            if (user.names.indexOf(profile.username) === -1) {
                user.names.push(profile.username);
            }

            if (lastMatchUpdate && lastMatchUpdate.match.conversation.id === conversationId) {
                const newCommonInterests = lastMatchUpdate.match.commonInterests.filter(i => profile.interests.indexOf(i) === -1);
                profile.interests.push(...newCommonInterests);
            }

            const newInterests = profile.interests.filter(i => user.interests.indexOf(i) === -1);
            user.interests.push(...newInterests);
            
            saveUser(user);

            if (currentlyFetching !== conversationId) {
                return;
            }
            currentlyFetching = '';

            currentUi = createUi(profile, user);
            document.querySelector('aside > div:nth-child(2) > div')!.prepend(currentUi);
        })
        .catch(console.error);
};

setLocationChangeCallback(onLocationChange);

setTimeout(() => {
    document.querySelector('aside > div:nth-child(2) > div > div')?.remove();
    onLocationChange(location.pathname);
}, 1000);
