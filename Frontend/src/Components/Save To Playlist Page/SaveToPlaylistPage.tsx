import { useEffect, useState } from 'react'
import httpClient from '../../httpClient';
import { playlistType, saveToPlaylist } from '../../Types/types';
import { BiSolidPlaylist } from 'react-icons/bi';
import { useDispatch, useSelector } from 'react-redux';
import { togglePopup } from '../../Slices/saveToPlaylistSlice';

const SaveToPlaylistPage = () => {

    const [playlist, setPlaylist] = useState([]);

    const [selected, setSelected] = useState<number[]>([]);

    const {songId} = useSelector((state:saveToPlaylist)=>state.saveToPlaylist)
    
    const dispatch = useDispatch();

    const playlistCall = async() => {
        const token = localStorage.getItem('token');
        try{
            const resp = await httpClient.get('/home-playlists', {
                headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
            })

            setPlaylist(resp.data);
            
        } catch(err) {
            console.error(err);
        }
    }

    useEffect(()=>{
        playlistCall();
    },[])

    const saveFunction = async() => {
        try{
            const resp = await httpClient.post('/saveToPlaylist',{
                selectedPlaylists: selected,
                songId: songId,
            })

            console.log(resp.data);
            dispatch(togglePopup())
            
        } catch(err) {
            console.error(err);
        }
    }

    const addSelection = (index: number) => {
        setSelected(prev =>
          prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

  return (
    <div className='w-full h-screen grid place-items-center fixed'>
        <div className='bg-black w-[30%] rounded-md'>
        <div className='bg-[#80808050] text-white h-full p-[1rem] rounded-md'>
            <p className='text-sm opacity-65'>Save to Playlist</p>
            <div className='w-full flex flex-wrap justify-between gap-2 mt-[1.3rem]'>
                {
                    playlist.map((item:playlistType, index:number)=>{
                        return(
                            <div key={index} className={`px-4 w-full py-2 flex items-center gap-4 cursor-pointer hover:bg-[#80808030]`} onClick={()=>addSelection(item.playlistId)}>
                                <div className={`w-[0.8rem] h-[0.8rem] rounded-full grid place-items-center ${selected.includes(item.playlistId) ? 'bg-[#E76716] border-2' : 'bg-white'}`}/>
                                <div className='w-[3rem] h-[3rem] text-xl rounded-lg text-black bg-white grid place-items-center'>
                                    <BiSolidPlaylist/>
                                </div>
                                <p className='text-xs font-semibold text-center'>{item.playlistName}</p>
                                <p className='text-xs text-center opacity-65 ml-auto'>{item.trackcount} Tracks</p>
                            </div>
                        )
                    })
                }
            </div>
            <div className='w-full gap-[1rem] mt-[1.3rem] flex justify-end'>
                <div className='py-3 text-center cursor-pointer rounded-md text-xs bg-[#80808030] w-[5rem]' onClick={()=>{dispatch(togglePopup())}}>Cancel</div>
                <div className='py-3 text-center cursor-pointer rounded-md text-xs bg-[#E76716] w-[5rem]' onClick={saveFunction}>Save</div>
            </div>
        </div>
        </div>
    </div>
  )
}

export default SaveToPlaylistPage
