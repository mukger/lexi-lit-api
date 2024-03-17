export interface UserAgent {
    browser: {
        family: string;
        version: string;
    },
    device: {
        family: string;
        version: string;
    },
    os: {
        family: string;
        major: string;
        minor: string;
    }
}