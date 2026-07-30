export const FAST_API_ENDPOINTS = {
    FACE: {
        recognize: "/face/recognize",
        register: (personId: string) => `/face/register/${personId}`,
    },
} as const;