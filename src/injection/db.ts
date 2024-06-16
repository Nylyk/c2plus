import { Dexie, type EntityTable } from 'dexie';

interface User {
    id: string,
    name: string,
    previousNames: string[],
    createdAt: string,
    matches: string[],
    commonInterests: string[],
    interests: string[],
    avoid: boolean,
    info: string
}
 
const db = new Dexie('c2plus') as Dexie & { users: EntityTable<User, 'id'> };
db.version(1).stores({
    users: '&id, matches, names, interests, avoid, info'
});
db.version(2).stores({
    users: '&id, name, *previousNames, createdAt, *matches, *commonInterests, *interests, avoid, info'
}).upgrade((transaction) => {
    console.log('Upgrading database to verson 2');
    return transaction.table('users').toCollection().modify((user) => {
        user.name = user.names[user.names.length - 1];
        user.previousNames = user.names.slice(0, -1);
        delete user.names;

        user.createdAt = '';
        user.commonInterests = [];
    });
});

db.users.count().then(count => console.log(`Loaded ${count} users`));

export { type User, db };
