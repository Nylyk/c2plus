import { Profile } from './api';
import { db, User } from './db';

const loadOrCreateUser = (profile: Profile): Promise<User> => {
    return db.users.get(profile.id)
        .then((user) => {
            if (!user) {
                user = {
                    id: profile.id,
                    name: profile.username,
                    previousNames: [],
                    createdAt: profile.createdAt,
                    matches: [],
                    commonInterests: [],
                    interests: profile.interests || [],
                    avoid: false,
                    info: ''
                };

                db.users.put(user);
            }

            return user;
        });
};

const updateUserFromProfile = (profile: Profile) => {
    return loadOrCreateUser(profile)
        .then((user) => {
            if (!user) {
                return;
            }

            if (user.name !== profile.username) {
                if (user.previousNames.indexOf(user.name) === -1) {
                    user.previousNames.push(user.name);
                }
                user.name = profile.username;
            }

            const newInterests = profile.interests?.filter(i => user.interests.indexOf(i) === -1);
            if (newInterests) {
                user.interests.push(...newInterests);
            }

            user.createdAt = profile.createdAt;

            db.users.put(user);
        })
};

export { loadOrCreateUser, updateUserFromProfile };
