import React from 'react'
import { loginCredentials, signupCredentials } from '../../Constants/LoginCredentials'

const Login = ({page, setPage, setCredentials, login, signup}:{page:Boolean, setPage:Function, setCredentials:Function, login:Function, signup:Function}) => {

    let list = page === true ? loginCredentials : signupCredentials;

  return (
    <div className='w-[52%] flex flex-col justify-evenly py-[3rem] gap-[3rem] items-center text-black bg-[#DADADA] rounded-lg'>
        <p className='font-medium text-xl'>{page===true ? 'Log in to your account' : 'Create a new account'}</p>
        <div className='w-[70%] text-sm flex flex-col gap-[1.5rem]'>
        {
            list.map((item,index)=>{
                return(
                    <div key={index}>
                        <p>{item.name}</p>
                        <input type={item.type} placeholder={item.placeholder} onChange={(e)=>{setCredentials((prev:String) => ({...prev,[item.refer]:e.target.value}))}} className='bg-[#FFFFFF90] text-black w-full h-[2.6rem] rounded-md mt-2 pl-3 outline-none'/>
                        {(page === true && item.type==='password') && <p className='text-right mt-2 text-xs cursor-pointer'>Forgot Password?</p>}
                    </div>
                )
            })
        }
        </div>
        <div className='w-[70%]'>
            <p className='h-[2.5rem] rounded-md grid place-items-center bg-[#E76716] text-white hover:bg-[#c75712] font-medium cursor-pointer' onClick={page===true ? ()=>login() : ()=>signup()}>{page === true ? 'Login' : 'Sign up'}</p>
        <p className='text-xs text-center mt-[1rem]'><span className='opacity-65'>{page === true ? "Don't have an account?" : "Already have an account?"}</span> <span className='cursor-pointer underline' onClick={()=>setPage((prev:Boolean)=>!prev)}>{page === true ? 'Sign up' : 'Login'}</span></p>
        </div>
    </div>
  )
}

export default Login