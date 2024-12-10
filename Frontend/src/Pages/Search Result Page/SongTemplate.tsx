import React from 'react'
import { PiVinylRecord } from 'react-icons/pi'
import { setDuration, setLiked, setMusicSeek, setPlay, setSongInfo } from '../../Slices/musicPlayerSlice';
import fetchSongUrl from '../../Functions/fetchSongUrl';
import { useDispatch } from 'react-redux';

const SongTemplate = ({songs}:{songs:{songId:string, coverUrl:string, songName:string, artistName: string, duration: string}[]}) => {

  const dispatch = useDispatch();

  const playSong = async (song:{songId:string, coverUrl:string, songName:string, artistName: string, duration: string}) => {
    
    dispatch(setSongInfo({
      song: {
        id: song.songId,
        name: song.songName,
        artist: song.artistName,
        urls: {
          mp3:null,
          cover: null,
          lyrics: null,
        },
      },
      songLength: song.duration,
    }));

    dispatch(setSongInfo({
      song: {
        id: song.songId,
        name: song.songName,
        artist: song.artistName,
        urls: await fetchSongUrl(song.songId),
      },
      songLength: song.duration,
    }));

    // dispatch(setLiked(song.isLiked))
    dispatch(setPlay({play:true}));
    dispatch(setMusicSeek({seek:0}));
    dispatch(setDuration({duration:0}));

    sessionStorage.setItem("songId", song?.songId?.toString());
  }

  return (
    <div className='mt-4'>
      <p>Songs</p>
      { 
      songs.length > 0 ? 
        <div className='mt-4 flex gap-[3rem]'>
        { songs.map((song)=>{
          return (
              <div key={song.songId} className='w-[12rem] flex flex-col cursor-pointer' onClick={()=>playSong(song)}>
                  <div className='w-full h-[12rem] bg-white text-black text-6xl grid place-items-center'>
                      { 
                        song.coverUrl ? <img src={song.coverUrl} alt="cover" className='w-full h-full'/> 
                        :
                        <PiVinylRecord/>
                      }
                  </div>
                  <p className='font-medium mt-3 text-center'>{song.songName}</p>
                  <p className='opacity-65 text-center mt-1'>{song.artistName}</p>
              </div>
          )
        })
        }
        </div> :
        <p className='my-[1.5rem] opacity-65 text-sm'>No Results Found</p>
      }
    </div>
  )
}
export default SongTemplate
