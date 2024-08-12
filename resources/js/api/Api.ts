import axios from "axios";

const baseApiUrl = window.baseApiUrl;
var Api = axios.create({
    baseURL: baseApiUrl,
    headers: { Accept: 'application/json' }
});

var InfinideaApi = axios.create({
    baseURL: baseApiUrl,
    headers: { Accept: 'application/json' }
});

export { Api, InfinideaApi };
