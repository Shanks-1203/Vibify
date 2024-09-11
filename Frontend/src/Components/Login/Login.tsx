import React from 'react'
import { loginCredentials, signupCredentials } from '../../Constants/LoginCredentials'

const Login = ({guestSignin, page, setPage, setCredentials, login, signup}:{guestSignin:Function, page:Boolean, setPage:Function, setCredentials:Function, login:Function, signup:Function}) => {

    let list = page === true ? loginCredentials : signupCredentials;

  return (
    <div className='w-[52%] flex flex-col justify-evenly py-[3rem] gap-[3rem] items-center text-black bg-[#DADADA] rounded-lg'>
        <p className='font-medium text-2xl'>{page===true ? 'Log in to your account' : 'Create a new account'}</p>
        <form className='w-[70%]' onSubmit={(e) => {
            e.preventDefault();
            page === true ? login() : signup();
        }}>
            <div className='flex flex-col gap-[1.5rem]'>
            {
                list.map((item,index)=>{
                    return(
                        <div key={index}>
                            <p>{item.name}</p>
                            <input type={item.type} placeholder={item.placeholder} onChange={(e)=>{setCredentials((prev:String) => ({...prev,[item.refer]:e.target.value}))}} className='bg-[#FFFFFF90] text-black w-full h-[2.6rem] rounded-md mt-2 pl-3 outline-none'/>
                            {(page === true && item.type==='password') && <p className='text-right mt-2 text-sm hover:underline cursor-pointer'>Forgot Password?</p>}
                        </div>
                    )
                })
            }
            </div>
            <div className='mt-[3rem]'>
                <button type='submit' className='h-[2.7rem] w-full rounded-md grid place-items-center bg-[#E76716] text-white hover:bg-[#c75712] font-medium cursor-pointer'>{page === true ? 'Login' : 'Sign up'}</button>
                <p className='text-sm text-center mt-[1rem]'><span className='opacity-65'>{page === true ? "Don't have an account?" : "Already have an account?"}</span> <span className='cursor-pointer underline hover:text-[#E76716]' onClick={()=>setPage((prev:Boolean)=>!prev)}>{page === true ? 'Sign up' : 'Login'}</span></p>
                <p className='text-sm text-center mt-4 cursor-pointer' onClick={()=>guestSignin()}>Sign in as a guest</p>
            </div>
        </form>
    </div>
  )
}

export default Login