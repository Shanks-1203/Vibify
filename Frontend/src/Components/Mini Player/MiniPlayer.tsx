import { useEffect, useRef, useState } from 'react'
import { PiVinylRecord } from 'react-icons/pi'
import { MdKeyboardArrowDown } from "react-icons/md";
import MiniSeekbar from '../Seekbar/Mini Seekbar/MiniSeekbar';
import MiniControls from '../Controls/Mini Controls/MiniControls';
import { useDispatch, useSelector } from 'react-redux';
import { setDuration, setMiniplayer, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice';
import { QueueState, Song, musicPlayerState } from '../../Types/types';
import { addToShuffledQueue, clearShuffledQueue, setPlayIndex } from '../../Slices/musicQueueSlice';
import { CiHeart } from "react-icons/ci";
import { MdOutlineLibraryAdd } from "react-icons/md";
import fetchSongUrl from '../../Functions/fetchSongUrl';
import { CgPlayListAdd } from "react-icons/cg";


const MiniPlayer = () => {

    const {Queue, shuffledQueue, playIndex} = useSelector((state:QueueState)=> state.musicQueue)
    const dispatch = useDispatch();
    const { miniplayer, duration, play, song, musicSeek, songLength, repeat, shuffle } = useSelector((state:musicPlayerState) => state.musicPlayer);
    const audioRef = useRef<HTMLAudioElement>(null);
    
    const playFromQueue = async(songIndex:number) => {
      dispatch(setPlayIndex(songIndex));

      dispatch(setSongInfo({
        song: {
          id: shuffle ? shuffledQueue[songIndex].songId : Queue[songIndex].songId,
          name: shuffle ? shuffledQueue[songIndex].songName : Queue[songIndex].songName,
          artist : shuffle ? shuffledQueue[songIndex].ArtistName : Queue[songIndex].ArtistName,
          mp3: null
        },
        songLength: shuffle ? shuffledQueue[songIndex].duration : Queue[songIndex].duration,
      }))

      dispatch(setSongInfo({
        song: {
          id: shuffle ? shuffledQueue[songIndex].songId : Queue[songIndex].songId,
          name: shuffle ? shuffledQueue[songIndex].songName : Queue[songIndex].songName,
          artist : shuffle ? shuffledQueue[songIndex].ArtistName : Queue[songIndex].ArtistName,
          mp3: await fetchSongUrl(shuffle ? shuffledQueue[songIndex].songId : Queue[songIndex].songId),
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
        if(song.mp3!==null){
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
        <CgPlayListAdd className='cursor-pointer'/>
      </div>

      <p className='text-2xl cursor-pointer rotate-180 transition-all' onClick={()=>dispatch(setMiniplayer({miniplayer:'max'}))}><MdKeyboardArrowDown/></p>
    
    </div>
  )
}

export default MiniPlayer
