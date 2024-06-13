let websocketConnected = false;

const setWebSocketMessageCallback = (handler: (msg: string) => Promise<any>) => {
    Object.defineProperty(WebSocket.prototype, 'onmessage', {
        set(this: WebSocket, oldHandler: (this: WebSocket, e: MessageEvent) => void) {
            this.addEventListener('message', (e): void => {
                websocketConnected = true;
                handler(e.data)
                    .then(() => oldHandler.call(this, e))
                    .catch(console.error);
            });
        }
    });
};

const setLocationChangeCallback = (handler: (path: string) => void) => {
    let oldPushState = history.pushState;
    history.pushState = function pushState() {
        oldPushState.apply(this, arguments as any);
        handler(location.pathname);
    };
    
    let oldReplaceState = history.replaceState;
    history.replaceState = function replaceState() {
        let oldPath = location.pathname;
        oldReplaceState.apply(this, arguments as any);
        if (location.pathname !== oldPath) {
            handler(location.pathname);
        }
    };
    
    window.addEventListener('popstate', () => {
        handler(location.pathname);
    });
};

export { websocketConnected, setWebSocketMessageCallback, setLocationChangeCallback };
