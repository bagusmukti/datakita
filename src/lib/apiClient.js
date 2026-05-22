import axios from 'axios';

const CORS_PROXY = import.meta.env.VITE_CORS_PROXY || 'https://corsproxy.io/?';

const client = axios.create({
  timeout: 20000,
  headers: { Accept: 'application/json' },
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const isNetworkError =
      error.code === 'ERR_NETWORK' ||
      error.message === 'Network Error' ||
      error.code === 'ERR_FAILED';

    if (isNetworkError && !config._proxyRetried) {
      config._proxyRetried = true;
      const originalUrl = config.url;
      config.url = `${CORS_PROXY}${encodeURIComponent(originalUrl)}`;
      console.info(`[apiClient] CORS fallback: retrying via proxy for ${originalUrl}`);
      return client.request(config);
    }

    return Promise.reject(error);
  }
);

export default client;
