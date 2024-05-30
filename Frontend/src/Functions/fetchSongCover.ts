import httpClient from "../httpClient";

const fetchSongCover = async (songId:number) => {
    try {
      const response = await httpClient.get(`/songCover/${songId}`);
      const url = response.data;
      return url
    } catch (error) {
      console.error('Error fetching song cover URL:', error);
    }
}

export default fetchSongCover