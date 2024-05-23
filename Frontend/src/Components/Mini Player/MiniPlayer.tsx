import { useEffect, useRef } from 'react'
import { PiVinylRecord } from 'react-icons/pi'
import { MdKeyboardArrowDown } from "react-icons/md";
import MiniSeekbar from '../Seekbar/Mini Seekbar/MiniSeekbar';
import MiniControls from '../Controls/Mini Controls/MiniControls';
import { useDispatch, useSelector } from 'react-redux';
import { setDuration, setMiniplayer, setMusicSeek, setSongInfo } from '../../Slices/musicPlayerSlice';
import { QueueState, musicPlayerState } from '../../Types/types';
import { setPlayIndex } from '../../Slices/musicQueueSlice';
import { CiHeart } from "react-icons/ci";
import { MdOutlineLibraryAdd } from "react-icons/md";



const MiniPlayer = () => {

    const {Queue, playIndex} = useSelector((state:QueueState)=> state.musicQueue)
    const dispatch = useDispatch();
    const { miniplayer, duration, play, song, musicSeek, songLength } = useSelector((state:musicPlayerState) => state.musicPlayer);
    const audioRef = useRef<HTMLAudioElement>(null);

    const playFromQueue = (songIndex:number) => {
        dispatch(setPlayIndex(songIndex));
        dispatch(setSongInfo({
            song: {
                id: songIndex,
                name: Queue[songIndex].songName,
                artist : Queue[songIndex].ArtistName
            },
            songLength: Queue[songIndex].duration,
        }))
        dispatch(setMusicSeek({seek:0}))
    }

    const prevButton = () => {
        if(duration>=5){
            if (audioRef.current) {
                dispatch(setMusicSeek({seek:0}))
            }
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

    useEffect(()=>{
        if(duration===songLength && (playIndex < (Queue.length - 1))){
            setTimeout(() => {
                nextButton();
            }, 1000);
        }
    },[duration])

    useEffect(() => {
        if (!play) {
          return;
        }
    
        const intervalId = setInterval(() => {
          dispatch(setDuration({ duration: duration + 1 }));
        }, 1000);
    
        return () => clearInterval(intervalId);
    }, [play, duration, dispatch]);

    const seeker = (event:any) => {
        var div:any = document.querySelector('.miniseek');
        var rect = div.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var seekBarWidth = rect.width;
        var percentage = (x / seekBarWidth) * 100;

        if (audioRef.current) {
            var songLength = audioRef.current.duration;
            var newTime = (percentage / 100) * songLength;
            dispatch(setMusicSeek({seek:newTime}))
        }
    }

    useEffect(()=>{
        if (audioRef.current) {
            audioRef.current.currentTime = musicSeek;
        }
        dispatch(setDuration({duration:musicSeek}))
    },[musicSeek])

    useEffect(() => {
        if (audioRef.current) {
            if (play) {
                audioRef.current.play().catch(error => {
                    console.error('Error playing audio:', error);
                });
            } else {
                audioRef.current.pause();
            }
        }
    }, [play]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = song.mp3;
            audioRef.current.load();
            audioRef.current.play().catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    }, [song.mp3]);

  return (
    <div className={`fixed z-10 text-white bottom-0 right-0 flex items-center px-4 justify-between bg-black w-full h-[8%] ${miniplayer === 'max' && 'hidden'}`}>
        
        <div className='flex items-center w-[15%]'>
            <div className='grid place-items-center'>
                <p className='p-[0.5rem] bg-white text-black rounded-lg text-3xl grid place-items-center'><PiVinylRecord /></p>
            </div>
        
            <div className='w-full ml-[1rem]'>
                <p className='text-sm font-medium'>{song.name}</p>
                <p className='mt-[0.2rem] text-xs opacity-80'>{song.artist}</p>
            </div>
        </div>

        <audio ref={audioRef} />
      
      <MiniControls prevButton={prevButton} nextButton={nextButton}/>
      
      <MiniSeekbar seeker={seeker}/>
      
      <div className='flex items-center gap-[2rem] text-2xl'>
        <CiHeart className='cursor-pointer'/>
        <MdOutlineLibraryAdd className='cursor-pointer'/>
      </div>

      <p className='text-2xl cursor-pointer rotate-180 transition-all' onClick={()=>dispatch(setMiniplayer({miniplayer:'max'}))}><MdKeyboardArrowDown/></p>
    
    </div>
  )
}

export default MiniPlayer
