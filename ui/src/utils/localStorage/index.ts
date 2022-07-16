export const setLocalStorage = (key: string, value: any) => {
	(window as any).localStorage.setItem(key, JSON.stringify(value));
};

export const getLocalStorage = (key: string): any => {
	const value = (window as any).localStorage.getItem(key);
	return JSON.parse(value);
};
