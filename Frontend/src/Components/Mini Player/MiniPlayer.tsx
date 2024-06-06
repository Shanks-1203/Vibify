import { useEffect, useRef, useState } from 'react'
import { PiVinylRecord } from 'react-icons/pi'
import { MdKeyboardArrowDown } from "react-icons/md";
import MiniSeekbar from '../Seekbar/Mini Seekbar/MiniSeekbar';
import MiniControls from '../Controls/Mini Controls/MiniControls';
import { useDispatch, useSelector } from 'react-redux';
import { setDuration, setLiked, setMiniplayer, setMusicSeek, setPlay, setSongInfo, togglePlay } from '../../Slices/musicPlayerSlice';
import { QueueState, Song, musicPlayerState } from '../../Types/types';
import { addToShuffledQueue, clearShuffledQueue, setPlayIndex } from '../../Slices/musicQueueSlice';
import { CiHeart } from "react-icons/ci";
import fetchSongUrl from '../../Functions/fetchSongUrl';
import { CgPlayListAdd } from "react-icons/cg";
import { setSongId, togglePopup } from '../../Slices/saveToPlaylistSlice';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import { like, unlike } from '../../Functions/manageLike';


const MiniPlayer = () => {

    const {Queue, shuffledQueue, playIndex} = useSelector((state:QueueState)=> state.musicQueue)
    const dispatch = useDispatch();
    const { miniplayer, isLiked, duration, play, song, musicSeek, songLength, repeat, shuffle } = useSelector((state:musicPlayerState) => state.musicPlayer);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [likeTrigger, setLikeTrigger] = useState(false);
    
    const playFromQueue = async(songIndex:number) => {
      dispatch(setPlayIndex(songIndex));

      dispatch(setSongInfo({
        song: {
          id: shuffle ? shuffledQueue[songIndex].songId : Queue[songIndex].songId,
          name: shuffle ? shuffledQueue[songIndex].songName : Queue[songIndex].songName,
          artist : shuffle ? shuffledQueue[songIndex].ArtistName : Queue[songIndex].ArtistName,
          lyrics: shuffle ? shuffledQueue[songIndex].lyrics : Queue[songIndex].lyrics,
          urls: {
            mp3:null,
            cover: null,
          },
        },
        songLength: shuffle ? shuffledQueue[songIndex].duration : Queue[songIndex].duration,
      }))

      dispatch(setSongInfo({
        song: {
          id: shuffle ? shuffledQueue[songIndex].songId : Queue[songIndex].songId,
          name: shuffle ? shuffledQueue[songIndex].songName : Queue[songIndex].songName,
          artist : shuffle ? shuffledQueue[songIndex].ArtistName : Queue[songIndex].ArtistName,
          lyrics: shuffle ? shuffledQueue[songIndex].lyrics : Queue[songIndex].lyrics,
          urls: await fetchSongUrl(shuffle ? shuffledQueue[songIndex].songId : Queue[songIndex].songId),
        },
        songLength: shuffle ? shuffledQueue[songIndex].duration : Queue[songIndex].duration,
      }))

      dispatch(setPlay({play:true}));
      dispatch(setMusicSeek({seek:0}));
      dispatch(setDuration({duration:0}));
    }    

    const prevButton = () => {
      if(shuffle ? shuffledQueue.length!==0 : Queue.length!==0){
        if(duration>=5){
          dispatch(setMusicSeek({seek:0}))
        }
        else{
          if(repeat==='off'){
            if(playIndex===0){
              playFromQueue(0);
            } else {
              playFromQueue(playIndex-1);
            }
          } else {
            if(playIndex===0){
              playFromQueue(shuffle ? shuffledQueue.length-1 : Queue.length-1);
            } else {
              playFromQueue(playIndex-1);
            }
          }
        }
      }
    }

    const nextButton = () => {
      if(shuffle ? shuffledQueue.length!==0 : Queue.length!==0){
          if(playIndex < (shuffle ? shuffledQueue.length - 1 : Queue.length-1)){
              playFromQueue(playIndex+1);
          } else {
              if(repeat!=='off'){
                  playFromQueue(0);
              }
          }
      }
    }

    useEffect(()=>{
      if(song.id===null){
        dispatch(setLiked(false))
      } else {
        dispatch(setLiked(!likeTrigger))
      }
    },[likeTrigger])

    useEffect(()=>{
        if(repeat==='once'){
            if(Math.floor(duration)===Math.floor(songLength)){
                setTimeout(() => {
                    dispatch(setDuration({duration:0}));
                    dispatch(setMusicSeek({seek:0}));
                    dispatch(setPlay({play:true}));
                    playFromQueue(playIndex);
                }, 1000);
            }
        } else {
            if(Math.floor(duration)===Math.floor(songLength) && (playIndex < (shuffle ? shuffledQueue.length - 1 : Queue.length-1))){
                setTimeout(() => {
                    nextButton();
                }, 1000);
            }
            else if(Math.floor(duration)===Math.floor(songLength)){
                if(repeat==='off'){
                    dispatch(setPlay({play:false}))
                    dispatch(setMusicSeek({seek:0}));
                    dispatch(setDuration({duration:0}));
                } else if (repeat==='on') {
                    setTimeout(() => {
                        nextButton()
                    }, 1000);
                }
            }
        }
    },[duration])

    useEffect(() => {
      if(shuffle){
        dispatch(clearShuffledQueue());
        dispatch(addToShuffledQueue(Queue[playIndex]));
        
        const remainingSongs = Queue.filter((item, index) => index !== playIndex);
        
        const shuffleArray = (array:Song[]) => {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
        };
        
        const shuffledSongs = shuffleArray(remainingSongs);
        
        shuffledSongs.map((song:Song) => {
          dispatch(addToShuffledQueue(song));
        });
        
        dispatch(setPlayIndex(0));
      } else {
        const songId = song.id;

        Queue.map((item,index)=>{
          if(item.songId === songId){
            dispatch(setPlayIndex(index));
          }
        })
      }
    }, [shuffle, dispatch, !shuffle && Queue]);
    
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
      if(song.urls.mp3!==null){
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
            audioRef.current.src = song.urls.mp3;
            audioRef.current.load();
            audioRef.current.play().catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    }, [song.urls.mp3]);

    const addToPlaylist = () => {
      if(song.urls.mp3){
        dispatch(togglePopup());
        dispatch(setSongId(song.id));
      }
    }

  return (
    <div className={`fixed z-10 text-white bottom-0 right-0 flex items-center px-4 justify-between bg-black w-full h-[8%] ${miniplayer === 'max' && 'hidden'}`}>
        
        <div className='flex items-center w-[15%]'>
            <div className='grid place-items-center'>
            <div className='w-[2.7rem] h-[2.7rem] bg-white text-black grid place-items-center text-3xl'>{song.urls.cover ? <img src={song.urls.cover} alt="Cover Image" className='w-full h-full'/> :<PiVinylRecord/>}</div>
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
        <p className='text-[1.04rem] ml-auto cursor-pointer'>{isLiked ? <FaHeart className='text-[#E76716]' onClick={(e)=>unlike(e, song.id, setLikeTrigger)}/> : <FaRegHeart className='opacity-65' onClick={(e:any)=>like(e, song.id, setLikeTrigger)}/>}</p>
        <CgPlayListAdd className='cursor-pointer' onClick={addToPlaylist}/>
      </div>

      <p className='text-2xl cursor-pointer rotate-180 transition-all' onClick={()=>dispatch(setMiniplayer({miniplayer:'max'}))}><MdKeyboardArrowDown/></p>
    
    </div>
  )
}

export default MiniPlayer