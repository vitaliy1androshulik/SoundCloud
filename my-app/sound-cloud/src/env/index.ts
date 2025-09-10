const REMOTE_BASE_URL: string = import.meta.env.VITE_BASE_URL;
const ACCESS_KEY: string = import.meta.env.VITE_ACCESS_KEY;

const APP_ENV = {
    REMOTE_BASE_URL,
    ACCESS_KEY,
}

console.log('REMOTE_BASE_URL:', REMOTE_BASE_URL);
export { APP_ENV };