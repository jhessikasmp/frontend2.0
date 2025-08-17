// utils/storage.ts
export const safeGetFromStorage = (key: string, defaultValue: any = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Erro ao ler ${key} do localStorage:`, error);
        localStorage.removeItem(key);
        return defaultValue;
    }
};

export const safeSetToStorage = (key: string, value: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
};
