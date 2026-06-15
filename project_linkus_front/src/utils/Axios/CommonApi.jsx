import axios from 'axios';

export default function CommonApi() {
    axios.create({
      baseURL: "http://localhost:8080/api",
      headers: {
        Authorization: `${localStorage.getItem(accessToken)}`,
      },
    });
}