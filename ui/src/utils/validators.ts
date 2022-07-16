export const validateWebsocketUrls = (input: string): boolean => {
	// Got (and modified a wee bit) the regex from here: https://stackoverflow.com/questions/57288837/regex-if-valid-websocket-address
	const regex =
		/^(wss?:\/\/)([0-9]{1,3}(?:\.[0-9]{1,3}){3}|(?=[^/]{1,254}(?![^/]))(?:(?=[a-zA-Z0-9-]{1,63}\.)(?:xn--+)?[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,63}):?([0-9]{1,5})?\/*(?:[\w\d-/])*$/;
	return regex.test(input);
};
