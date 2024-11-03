import axios from 'axios';
import { defaultConfig } from '@/config/config';

const axiosInstance = axios.create({
	baseURL: defaultConfig.baseURL,
	withCredentials: true
});

export default axiosInstance;