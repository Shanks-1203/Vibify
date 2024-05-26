import { useState } from 'react'
import httpClient from '../../httpClient'
import Login from '../../Components/Login/Login'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {

  const navigate = useNavigate();

  const [page, setPage] = useState(true);

  const [credentials, setCredentials] = useState({
    loginCredential:'',
    username: '',
    email: '',
    password: ''
  })

  const login = async() => {
    try{
      const resp = await httpClient.post('/login', {
        loginCredential: credentials.loginCredential,
        password: credentials.password
      })

      if(resp?.status===200){
        localStorage.setItem('token', resp?.data?.token)
        navigate('/');
      } 

    } catch(err:any){
      console.error(err);
      if(err?.response?.status===401) {
          alert('Wrong Credentials')
       } else if(err?.response?.status===404) {
          alert('User Not Found')
       }
    }
  }

  const signup = async() => {
    try{
      const resp = await httpClient.post('/signup', {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
      })

      console.log(resp);

      if(resp?.status===200){
        alert('User Registration Successful, Go back and login')
      }

    } catch(err:any){

      if(err?.response?.status===409){
        alert(err?.response?.data)
      }
      console.error(err);
    }
  }

  return (
    <div className='w-full flex text-white h-screen bg-black'>
      <div className="w-[50%] grid place-items-center">
        <div>
          <p className='text-7xl'>Vibe<br />to the<br /><span className='text-8xl font-semibold text-[#E76716]'>Rhythm</span></p>
          <p className='mt-3'>with Vibify</p>
        </div>
      </div>
      <div className="w-[50%] grid place-items-center">

      <Login page={page} setPage={setPage} setCredentials={setCredentials} login={login} signup={signup} />

      </div>
    </div>
  )
}

export default LoginPage
