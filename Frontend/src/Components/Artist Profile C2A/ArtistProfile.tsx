import durationCalculator from '../../Functions/durationCalculator'
import { useDispatch, useSelector } from 'react-redux'
import { setDuration, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice'
import { PiVinylRecord } from 'react-icons/pi'
import fetchSongUrl from '../../Functions/fetchSongUrl'

export const ListenNowBtn = () => {
  return (
    <div className='px-4 cursor-pointer py-[0.7rem] flex justify-center gap-[0.5rem] items-center text-[0.75rem] font-medium rounded-full text-black bg-[#E76716]'>
        Listen Now
    </div>
  )
}

export const PopularSongs = ({songs}:{songs:{ ArtistId:number, ArtistName:String, FollowersCount: number, songId:number, songName:String, duration:number}[]}) => {
    
    const dispatch = useDispatch()

    const playSong = async(item:{ArtistId: number, ArtistName: String, FollowersCount: number, duration: number, songId: number, songName: String}) => {  
        
      dispatch(setSongInfo({
        song: {
          id: item.songId,
          name: item.songName,
          artist: item.ArtistName,
          mp3: null
        },
        songLength: item.duration,
      }));
  
      dispatch(setSongInfo({
        song: {
          id: item.songId,
          name: item.songName,
          artist: item.ArtistName,
          mp3: await fetchSongUrl(item.songId),
        },
        songLength: item.duration,
      }));

        dispatch(setPlay({play:true}));
        dispatch(setMusicSeek({seek:0}));
        dispatch(setDuration({duration:0}));
    
        sessionStorage.setItem("songId", item?.songId?.toString());
      }

    return (
        <div className='mt-[2rem]'>
            <p className='font-semibold text-lg text-white'>Popular Songs</p>
            <div className='mt-[2rem] w-full flex flex-col gap-1'>
                {
                    songs.map((item, index)=>{
                        return(
                            <div key={item.songId} className='w-full cursor-pointer py-[0.8rem] rounded-md flex justify-between text-sm hover:scale-[1.01] hover:bg-[#80808040] transition-all items-center text-white px-[2rem]' onClick={()=>playSong(item)}>
                                <div className='flex items-center gap-[2rem]'>
                                    <p>{index+1}</p>
                                    <PiVinylRecord className='text-4xl p-[0.2rem] text-black rounded-sm bg-white' />
                                    <p>{item.songName}</p>
                                </div>
                                <p className='text-sm'>{durationCalculator(item.duration)}</p>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}