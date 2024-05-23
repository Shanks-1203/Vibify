import React from 'react'
import { FaPlay } from "react-icons/fa";
import './startListeningBtn.css'
import { Link } from 'react-router-dom';

const StartListeningBtn = () => {

    const myFunction = () => {
        console.log('hello');
    }

  return (
    <Link to='/home'><div className='mt-[3rem] w-fit py-[17px] px-[20px] rounded-full flex items-center startListening bg-[#23BDB6] hover:bg-[#08A199] text-white cursor-pointer' onClick={myFunction}>
        <FaPlay />
        <p className='ml-3'>Start Listening...</p>
    </div></Link>
  )
}

export default StartListeningBtn
