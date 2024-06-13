import { Dexie, type EntityTable } from 'dexie';

interface User {
    id: string,
    matches: string[],
    names: string[],
    interests: string[],
    avoid: boolean,
    info: string
}
 
const db = new Dexie('c2plus') as Dexie & { users: EntityTable<User, 'id'> };
db.version(1).stores({
    users: '&id, matches, names, interests, avoid, info'
});

const loadUser = (id: string): Promise<User> => {
    return db.users.get(id)
        .then((user) => {
            if (!user) {
                user = {
                    id,
                    matches: [],
                    names: [],
                    interests: [],
                    avoid: false,
                    info: ''
                };

                db.users.put(user);
            }

            return user;
        });
};

const saveUser = (user: User): Promise<void> => {
    return db.users.put(user).then();
};

export { User, loadUser, saveUser };
