export default class TodoSSEReceiver {
    event: EventSource;
    callbacks: Map<string, (data: any) => void>;

    constructor(url: string) {
        this.event = new EventSource(url);

        this.callbacks = new Map<string, (data: any) => void>();
    }

    eventHandler(event: string, data: MessageEvent<any>, callback: (data: any) => void) {
        console.info(`[SSEHandler] Got event: ${event}`);
        callback(JSON.parse(data.data));
    }

    on(event: string, callback: (data: any) => void) {
        this.callbacks.set(event, callback);
        this.event.addEventListener(event, (data) => this.eventHandler(event, data, callback));
    }

    off(event: string) {
        const callback = this.callbacks.get(event);
        if (callback !== undefined) {
            this.event.removeEventListener(event, (data) => this.eventHandler(event, data, callback));
            this.callbacks.delete(event);
        }
    }

    shutdown() {
        this.event.close();
    }
}
