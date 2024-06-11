interface UserInfo {
    matches: string[],
    names: string[],
    interests: string[],
    avoid: boolean,
    info: string
}

let db: IDBDatabase | undefined;
const dbOpenRequest = indexedDB.open('c2plus');

dbOpenRequest.onsuccess = (event) => {
    console.log('Databased opened');
    db = dbOpenRequest.result;
    const countRequest = db.transaction('users').objectStore('users').count();
    countRequest.onsuccess = () => console.log(`${countRequest.result} users loaded`);
};

dbOpenRequest.onupgradeneeded = (event) => {
    db = dbOpenRequest.result;
    db.onerror = (event) => {
        console.error('Error opening database: ', event);
    };

    const userStore = db.createObjectStore('users', { keyPath: 'id' });
    userStore.createIndex('matches', 'matches');
    userStore.createIndex('names', 'names');
    userStore.createIndex('interests', 'interests');
    userStore.createIndex('avoid', 'avoid');
    userStore.createIndex('info', 'info');
};

dbOpenRequest.onerror = (event) => {
    console.error('Error opening database: ', event);
};

const getUserInfo = (id: string): Promise<UserInfo> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not opened');
            return;
        }
    
        const transaction = db.transaction('users', 'readwrite').objectStore('users');
        const request = transaction.openCursor(id);
        request.onsuccess = () => {
            if (!request.result) {
                let userInfo = {
                    matches: [],
                    names: [],
                    interests: [],
                    avoid: false,
                    info: ''
                };
                const request = transaction.put({ id, ...userInfo });
                request.onsuccess = () => resolve(userInfo);
                return;
            }

            resolve(request.result.value);
        };
    });
};

const setUserInfo = (id: string, userInfo: UserInfo): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not opened');
            return;
        }
        const request = db.transaction('users', 'readwrite').objectStore('users').put({ id, ...userInfo });
        request.onsuccess = () => resolve();
    });
};

export { UserInfo, getUserInfo, setUserInfo };
