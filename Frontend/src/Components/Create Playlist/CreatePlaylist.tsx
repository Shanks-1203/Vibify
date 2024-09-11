import { useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { toggleCreatePopup } from "../../Slices/saveToPlaylistSlice";
import httpClient from "../../httpClient";
import { saveToPlaylist } from "../../Types/types";

const CreatePlaylist = () => {

  const [name, setName] = useState('');
  const dispatch = useDispatch();
  const {createPopup} = useSelector((state:saveToPlaylist)=> state.saveToPlaylist)

  const handleChange = (e:any) => {
    setName(e.target.value);
  }


  const handleSubmit = async() => {
    const token = localStorage.getItem('token')
    try{
      await httpClient.post('/create/playlist',{playlistName : name}, 
      {
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      dispatch(toggleCreatePopup())
    } catch(err) {
      console.log(err);
    }
  }

  return (
    <div className={`w-full transition-all h-screen grid place-items-center fixed ${createPopup ? 'scale-100' : 'scale-0'}`} >

      <div className='w-[25%] rounded-md bg-black text-white overflow-hidden'>
        <div className='w-full p-[1.5rem] flex flex-col bg-[#80808050]'>
          <p className='opacity-65'>Create Playlist</p>
          
          <div className='mt-4'>
            <p>Playlist Name</p>
            <input value={name} type="text" className='mt-2 w-full bg-transparent border-2 rounded-md p-2 border-[#80808070] outline-none' placeholder='Vibify Playlist' onChange={(e)=>handleChange(e)}/>
          </div>

          <div className='flex justify-end gap-[1rem] items-center mt-6'>
            <p className='py-3 w-[6rem] text-center rounded-md cursor-pointer bg-[#80808030]' onClick={()=>dispatch(toggleCreatePopup())}>Cancel</p>
            <p className={`py-3 w-[6rem] text-center rounded-md cursor-pointer ${name ? 'bg-[#E76716]' : 'bg-[#808080] opacity-65'}`} onClick={handleSubmit}>Create</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePlaylist
