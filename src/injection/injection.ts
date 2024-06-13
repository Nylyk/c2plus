import { getUserInfo, setUserInfo } from './user';
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

    return getUserInfo(profile.id)
        .then((userInfo) => {
            if (userInfo.matches[userInfo.matches.length-1] !== message.match.conversation.createdAt) {
                userInfo.matches.push(message.match.conversation.createdAt);
            }

            return setUserInfo(profile.id, userInfo);
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
        .then(id => Promise.all([fetchProfile(id), getUserInfo(id)]))
        .then(([profile, userInfo]) => {
            if (userInfo.names.indexOf(profile.username) === -1) {
                userInfo.names.push(profile.username);
            }

            if (lastMatchUpdate && lastMatchUpdate.match.conversation.id === conversationId) {
                const newCommonInterests = lastMatchUpdate.match.commonInterests.filter(i => profile.interests.indexOf(i) === -1);
                profile.interests.push(...newCommonInterests);
            }

            const newInterests = profile.interests.filter(i => userInfo.interests.indexOf(i) === -1);
            userInfo.interests.push(...newInterests);
            
            setUserInfo(profile.id, userInfo);

            if (currentlyFetching !== conversationId) {
                return;
            }
            currentlyFetching = '';

            currentUi = createUi(profile, userInfo);
            document.querySelector('aside > div:nth-child(2) > div')!.prepend(currentUi);
        })
        .catch(console.error);
};

setLocationChangeCallback(onLocationChange);

setTimeout(() => {
    document.querySelector('aside > div:nth-child(2) > div > div')?.remove();
    onLocationChange(location.pathname);
}, 1000);
