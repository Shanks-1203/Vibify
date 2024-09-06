import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { profileDetails } from '../../Types/types'
import httpClient from '../../httpClient'
import { updateProfileDetails } from '../../Slices/profileDetailsSlice'
import { SlEarphones } from 'react-icons/sl'

const ProfilePage = () => {
  const { userProfileName, profilePic } = useSelector(
    (state: profileDetails) => state.profileDetails
  )
  const dispatch = useDispatch()
  // const [nameEdit, setNameEdit] = useState(false);
  const [editMode, setEditMode] = useState(false)
  const [newProfile, setNewProfile] = useState('')
  const [fileToSend, setFileToSend] = useState<Blob | null>()
  const [reloadTrigger, setReloadTrigger] = useState<boolean>(true)
  const token = localStorage.getItem('token')  

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProfileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const dataURLToBlob = (dataURL: string): Blob => {
    const [header, data] = dataURL.split(',')
    const mimeString = header.split(':')[1].split(';')[0]
    const byteString = atob(data)
    const arrayBuffer = new ArrayBuffer(byteString.length)
    const uint8Array = new Uint8Array(arrayBuffer)

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i)
    }

    return new Blob([arrayBuffer], { type: mimeString })
  }

  const getUserDetails = async () => {
    const resp = await httpClient.get('/profile', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const { userName, profileUrl, isLoggedIn } = resp.data

    if (!profileUrl) {
      dispatch(
        updateProfileDetails({
          userProfileName: userName,
          profilePic: null,
          isLoggedIn: isLoggedIn,
        })
      )
    }

    if (resp.data && profileUrl) {
      dispatch(
        updateProfileDetails({
          userProfileName: userName,
          profilePic: profileUrl,
          isLoggedIn: isLoggedIn,
        })
      )
    }
  }

  const handleImageChange = (event: any) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.src = reader.result as string
        img.onload = () => {
          const size = Math.min(img.width, img.height)
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          canvas.width = size
          canvas.height = size

          const xOffset = (img.width - size) / 2
          const yOffset = (img.height - size) / 2

          ctx?.drawImage(img, xOffset, yOffset, size, size, 0, 0, size, size)

          const croppedImageUrl = canvas.toDataURL('image/jpeg')
          setNewProfile(croppedImageUrl)

          const blob = dataURLToBlob(croppedImageUrl)
          setFileToSend(blob)
        }
      }
      reader.readAsDataURL(file)
    }

    if (event.target) {
      event.target.value = '';
    }
  }

  const handleSave = async () => {
    const formData = new FormData()

    if (fileToSend) {
      formData.append('profilePicture', fileToSend, 'profilePicture.jpg')
    }

    try {
      await httpClient.post('/edit/profile', formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'multipart/form-data',
        },
      })

      dispatch(
        updateProfileDetails({
          userProfileName: null,
          profilePic: null,
          isLoggedIn: null,
        })
      )

      setReloadTrigger((prev) => !prev)
      setEditMode(false)
      setNewProfile('')
      setFileToSend(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleClose = () => {
    setEditMode(false); 
    setNewProfile(''); 
    setFileToSend(null);
  }

  useEffect(() => {
    getUserDetails()
    //eslint-disable-next-line
  }, [reloadTrigger])

  return (
    <div className='h-[92vh] w-full p-[2rem] relative'>
      <div className='flex items-center gap-[2rem]'>
        <div
          className='w-[10rem] bg-[#E76716] grid place-items-center h-[10rem] rounded-full overflow-hidden cursor-pointer'
          onClick={() => {
            setEditMode(true)
          }}
        >
          {profilePic ? (
            <img
              src={profilePic}
              alt='Profile'
              className='w-full h-full rounded-full'
            />
          ) : (
            <SlEarphones className='text-white text-3xl' />
          )}
        </div>
        <p className='font-semibold text-xl grid place-items-center text-white'>
          {userProfileName}
        </p>
        <input
          type='file'
          accept='image/*'
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => handleImageChange(e)}
        />
      </div>

      {editMode && (
        <div className='w-full h-screen absolute top-0 left-0 grid place-items-center bg-opacity-80 backdrop-blur'>
          <div className='w-[22rem] h-[26rem] rotate-[5deg] p-[1rem] bg-white rounded-sm flex flex-col items-center justify-between'>
            <div className='w-full h-[20rem] relative rounded-sm bg-black grid place-items-center cursor-pointer' onClick={handleProfileClick}>
              {newProfile ? (
                <img src={newProfile} alt='New Profile' className='w-full h-full' />
              ) : profilePic ? (
                <img src={profilePic} alt='Profile' className='w-full h-full' />
              ) : (
                <div className='text-white flex flex-col items-center'>
                  <p className='text-3xl font-bold'>404</p>
                  <p>Profile picture not found</p>
                </div>
              )}
            </div>
            <div className='w-full flex justify-evenly'>
              <div
                className='py-3 text-center cursor-pointer text-[#E76716] rounded-md text-xs border-[#E76716] border-2 w-[5rem]'
                onClick={handleClose}
              >
                Close
              </div>
              {newProfile && (
                <div
                  className='py-3 text-center cursor-pointer text-white rounded-md text-xs bg-[#E76716] w-[5rem]'
                  onClick={handleSave}
                >
                  Save
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
