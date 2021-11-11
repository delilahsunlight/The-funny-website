export function ifDebug(callback: () => void) {
    if (DEV) {
        return callback();
    }
}

export function bindToWindow(name: string, any: any) {
    ifDebug(() => {
        (window as any)[name] = any;
    }) 
}
export function unbindToWindow(name: string) {
    ifDebug(() => {
        (window as any)[name] = undefined;
        delete (window as any)[name];
    }) 
}
