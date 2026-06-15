import axios from 'axios';

const Api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers : {
        "Authorization" : `${localStorage.getItem(accessToken)}`
    }
});

export default Api;