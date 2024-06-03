import httpClient from "../httpClient";

export const like = async(e:any, songId:number, setLikeTrigger:Function) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try{
      const res = await httpClient.post(`/like/${songId}`,{}, {
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setLikeTrigger((prev:Boolean)=>!prev)
    } catch(err){
      console.error(err)
    }
}

export const unlike = async(e:any, songId:number, setLikeTrigger:Function) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try{
      const res = await httpClient.delete(`/unlike/${songId}`, {
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setLikeTrigger((prev:Boolean)=>!prev)
    } catch(err){
      console.error(err)
    }
}