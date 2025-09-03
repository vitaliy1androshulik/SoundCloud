const REMOTE_BASE_URL: string = import.meta.env.VITE_BASE_URL;


const APP_ENV = {
    REMOTE_BASE_URL,
}

console.log('REMOTE_BASE_URL:', REMOTE_BASE_URL);
export { APP_ENV };