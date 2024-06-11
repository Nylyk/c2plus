interface Profile {
    id: string,
    username: string,
    avatar: string,
    createdAt: string,
    preferences: {
        showInterests: string,
        showPremiumBadge: string,
    },
    interests: string[],
    badges: number[]
}

interface Conversation {
    id: string,
    createdAt: string,
    participants: { profile: Profile }[]
}

interface MatchUpdateMessage {
    inQueue: boolean,
    match: {
        closure: {
            closed: boolean
        },
        conversation: Conversation,
        commonInterests: string[]
    }
}

const fetchMeProfile = async (): Promise<Profile> => {
    const res = await fetch('https://api.chitchat.gg/users/me', { credentials: 'include' });
    return await res.json();
};

const fetchProfile = async (id: string): Promise<Profile> => {
    const res = await fetch(`https://api.chitchat.gg/users/${id}/profile`, { credentials: 'include' });
    return await res.json();
};

const conversationCache: Map<string, string> = new Map();

const fetchConversations = async (type: 'match' | 'dm'): Promise<Conversation[]> => {
    const res = await fetch(`https://api.chitchat.gg/users/me/conversations/${type}`, { credentials: 'include' });
    const conversations = await res.json() as Conversation[];
    conversations.forEach(c => conversationCache.set(c.id, c.participants[0].profile.id));
    return conversations;
};

const getUserIdFromConversation = async (conversationId: string): Promise<string> => {
    let id = conversationCache.get(conversationId);
    if (!id) {
        let conversations = await fetchConversations('match');
        id = conversations.find(c => c.id === conversationId)?.participants[0].profile.id;
        if (!id) {
            conversations = await fetchConversations('dm');
            id = conversations.find(c => c.id === conversationId)?.participants[0].profile.id;
            if (!id) {
                throw 'Conversation not found';
            }
        }
    }

    return id;
};

export { Profile, Conversation, MatchUpdateMessage, fetchMeProfile, fetchProfile, getUserIdFromConversation };
