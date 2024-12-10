import React, { useState } from 'react'
import { IoSearchOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { searchState } from '../../Types/types';
import { searchAction, setSearch } from '../../Slices/searchSlice';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {keyword} = useSelector((state:searchState) => state.search);

  const search = (e:any) => {
    e.preventDefault()
    if(keyword.length>0){
      dispatch(searchAction())
      navigate(`/search/${keyword}`)
    }
  }

  return (
    <form onSubmit={(e)=>search(e)} className='w-[40%] h-full text-white bg-[#80808070] flex items-center rounded-md my-2 px-4 text-sm opacity-80'>
      <p className='text-[1.5rem]'><IoSearchOutline/></p>
      <input onChange={(e) => dispatch(setSearch(e.target.value))} value={keyword} type="text" className='w-full h-full outline-none bg-transparent ml-[0.7rem] placeholder-white' placeholder='Search by songs, artists or albums'/>
    </form>
  )
}

export default SearchBar
