import httpClient from "../httpClient";

export const like = async(e:any, songId:string, setLikeTrigger:Function) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try{
      await httpClient.post(`/like/${songId}`,{}, {
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setLikeTrigger((prev:Boolean)=>!prev)
    } catch(err){
      console.error(err)
    }
}

export const unlike = async(e:any, songId:string, setLikeTrigger:Function) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try{
      await httpClient.delete(`/like/${songId}`, {
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setLikeTrigger((prev:Boolean)=>!prev)
    } catch(err){
      console.error(err)
    }
}