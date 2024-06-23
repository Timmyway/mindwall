import axios from "axios";

var Api = axios.create({
    baseURL: 'http://mindwall.local',
    headers: { Accept: 'application/json' }
});

export { Api };
