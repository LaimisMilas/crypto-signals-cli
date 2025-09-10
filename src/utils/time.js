export const toUnix = date => Math.floor(new Date(date).getTime());
export const fromUnix = ts => new Date(ts);
export const sleep = ms => new Promise(res => setTimeout(res, ms));
