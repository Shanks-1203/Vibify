import { musicPlayerState } from '../../Types/types';
import { useSelector } from 'react-redux';

const LyricsArea = () => {
  const { song } = useSelector((state:musicPlayerState) => state.musicPlayer);
    
  return (
    <div className={`w-full text-sm ${(!song.lyrics) && 'h-full grid place-items-center'}`}>
      {
        song.lyrics ?
        <div className='overflow-auto'>
          <div className='whitespace-pre-wrap'>{song.lyrics}</div>
        </div> :
        <p>No lyrics available</p>
      }
    </div>
  )
}

export default LyricsArea