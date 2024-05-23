import axios from "axios";

export default axios.create({
    withCredentials:false,
    baseURL: 'http://localhost:8080',
});