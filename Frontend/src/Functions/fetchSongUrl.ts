import httpClient from "../httpClient";

const fetchSongUrl = async (songId:string) => {
    try {
      const response = await httpClient.get(`/song/${songId}`);
      const url = response.data;
      return url;
    } catch (error) {
      console.error('Error fetching song URL:', error);
    }
}

export default fetchSongUrl