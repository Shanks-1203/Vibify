import { musicPlayerState } from '../../Types/types';
import { useSelector } from 'react-redux';

const LyricsArea = () => {
  const { song } = useSelector((state:musicPlayerState) => state.musicPlayer);
    
  return (
    <div className={`w-full text-sm mt-4 ${(!song.urls.lyrics) && 'h-full grid place-items-center'}`}>
      {
        song.urls.lyrics ?
        <div className='overflow-auto'>
          <div className='whitespace-pre-wrap'>{song.urls.lyrics}</div>
        </div> :
        <p>No lyrics available</p>
      }
    </div>
  )
}

export default LyricsArea