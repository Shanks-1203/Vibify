import React, { useEffect, useState } from 'react'
import loading from '../Assets/Images/Logo.png'
import './loader.css'

const Loader = ({text}:{text:string}) => {

    const [loadingColor, setLoadingColor] = useState(true);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const intervalId = setInterval(() => {
                setLoadingColor((prev) => !prev);
            }, 1000);
    
            return () => clearInterval(intervalId);
        }, 500);
    
        return () => clearTimeout(timeoutId);
    }, []);

  return (
    <div className='w-full h-[92vh] bg-black grid place-items-center'>
        <div className='flex flex-col items-center gap-[1rem]'>
            <img src={loading} alt="loading" className={`w-[2.5rem] invert animate-bounce ${loadingColor ? 'invert' : 'orange-filter'}`} />
            <p className='text-white text-lg'>{text}</p>
        </div>
    </div>
  )
}

export default Loader
