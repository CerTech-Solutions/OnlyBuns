import axios from 'axios';
import { defaultConfig } from '@/config/config';
import router from '@/router';
import { store } from '@/utils/store';

const axiosInstance = axios.create({
	baseURL: defaultConfig.baseURL,
	withCredentials: true
});

axiosInstance.interceptors.response.use(
	res => res,
	error => {
		if (error.response.status === 401 || error.response.status === 403) {
			store.clearUser();
			router.replace({ path: '/' });
		}

		return Promise.reject(error);
	}
);

export default axiosInstance;