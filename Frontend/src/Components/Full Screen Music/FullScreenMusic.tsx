import { MdKeyboardArrowDown } from 'react-icons/md'
import { PiVinylRecord } from 'react-icons/pi'
import QueueList from '../Queue List/QueueList'
import './fullScreenMusic.css'
import SeekBar from '../Seekbar/SeekBar'
import FullScreenControls from '../Controls/Full Screen Controls/FullScreenControls'
import { useDispatch, useSelector } from 'react-redux'
import { setDuration, setMiniplayer, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice'
import { setPlayIndex } from '../../Slices/musicQueueSlice'
import { QueueState, musicPlayerState } from '../../Types/types'
import fetchSongUrl from '../../Functions/fetchSongUrl'

const FullScreenMusic = () => {

    const dispatch = useDispatch();
    const { miniplayer, song, duration, songLength } = useSelector((state:musicPlayerState) => state.musicPlayer);
    const {Queue, playIndex} = useSelector((state:QueueState)=> state.musicQueue)

    const playFromQueue = async(songIndex:number) => {
      dispatch(setPlayIndex(songIndex));

      dispatch(setSongInfo({
        song: {
          id: Queue[songIndex].songId,
          name: Queue[songIndex].songName,
          artist : Queue[songIndex].ArtistName,
          mp3: null
        },
        songLength: Queue[songIndex].duration,
      }))

      dispatch(setSongInfo({
        song: {
          id: Queue[songIndex].songId,
          name: Queue[songIndex].songName,
          artist : Queue[songIndex].ArtistName,
          mp3: await fetchSongUrl(Queue[songIndex].songId),
        },
        songLength: Queue[songIndex].duration,
      }))

      dispatch(setPlay({play:true}));
      dispatch(setMusicSeek({seek:0}));
      dispatch(setDuration({duration:0}));
    }

    const seeker = (event:any) => {
        var div:any = document.querySelector('.seek');
        var rect = div.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var seekBarWidth = rect.width;
        var percentage = (x / seekBarWidth) * 100;
    
        var newTime = (percentage / 100) * songLength;
        dispatch(setMusicSeek({seek:newTime}))
    }

    const prevButton = () => {
      if(duration>=5){
        dispatch(setMusicSeek({seek:0}))
      }
      else{
          if(playIndex===0){
              playFromQueue(0);
          } else {
              playFromQueue(playIndex-1);
          }
      }
    }

    const nextButton = () => {
      playFromQueue(playIndex+1);
    }

  return (
    <div className={`${miniplayer==='max' ? 'w-[85%] h-screen p-[3rem]' : 'w-0 h-0'} overflow-hidden flex fixed text-white z-10 bg-black`}>
      <div className='w-[60%] h-full flex flex-col justify-center relative items-center'>
      <div className='flex items-center absolute top-3 right-7'>
            <p className='text-2xl cursor-pointer transition-all' onClick={()=>dispatch(setMiniplayer({miniplayer:'on'}))}><MdKeyboardArrowDown/></p>
        </div>
        <div className='w-[15rem] h-[15rem] bg-white text-black grid place-items-center text-[6rem]'><PiVinylRecord/></div>
        <p className='font-semibold mt-[2rem] text-xl'>{song.name}</p>
        <p className='text-sm mt-2 opacity-65'>{song.artist}</p>
        
        <SeekBar seeker={seeker}/>

        <FullScreenControls prevButton={prevButton} nextButton={nextButton}/>

      </div>

      <div className='w-[40%] text-white rounded-md h-full'>
        <div className='flex gap-[1rem] text-sm h-[7%]'>
            <p className='p-[0.6rem] cursor-pointer border-t-2 border-[#E76716] text-[#E76716] font-semibold bg-gradient-to-b from-[#E7671660] to-black px-3'>Queue</p>
            <p className='p-[0.6rem] cursor-pointer'>Lyrics</p>
            <p className='p-[0.6rem] cursor-pointer'>Artist</p>
        </div>
        <div className={`h-[93%] ${miniplayer==='max' ? 'overflow-y-scroll overflow-x-hidden' : 'overflow-hidden'} queueList`}>
            <QueueList playFromQueue={playFromQueue}/>
        </div>
      </div>
    </div>
  )
}

export default FullScreenMusic
