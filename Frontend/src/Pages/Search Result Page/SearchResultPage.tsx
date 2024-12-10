import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { searchState } from '../../Types/types';
import CommonHeader from '../../Components/Header/CommonHeader';
import SongTemplate from './SongTemplate';
import { setSearch } from '../../Slices/searchSlice';
import httpClient from '../../httpClient';
import ArtistTemplate from './ArtistTemplate';
import SearchLoader from '../../Loaders/Search Loader/SearchLoader';
import PlaylistsTemplate from './PlaylistsTemplate';

const SearchResultPage = () => {

  const {keyword, search} = useSelector((state:searchState) => state.search);
  const [searchTerm, setSearchTerm] = useState(keyword)
  const [songs, setSongs] = useState([])
  const [artists, setArtists] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const getResults = async(query:string) => {
    setLoading(true);
    const token = localStorage.getItem('token')
    try{
      const resp = await httpClient.get(`/search/${query}`,{
        headers:  token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      setSongs(resp.data.songs)
      setArtists(resp.data.artists)
      setPlaylists(resp.data.playlists)
    } catch(err){
      console.log(err)
    }
    setLoading(false);
  }
  
  useEffect(()=>{
    const loc = window.location.pathname.split('/')[2];
    setSearchTerm(loc)
    getResults(loc)
    //eslint-disable-next-line
  },[search])
  
  useEffect(()=>{
    const loc = window.location.pathname.split('/')[2];
    setSearchTerm(loc)
    dispatch(setSearch(loc))
    getResults(loc)
    //eslint-disable-next-line
  },[])

  return (
    <>
      { loading ? 
        <SearchLoader/> :
        <div className='min-h-[92vh] bg-black text-white p-[2rem]'>
          <CommonHeader/>
          <p className='text-2xl font-semibold mt-8'>Search Results for: {searchTerm}</p>
          <SongTemplate songs={songs}/>
          <ArtistTemplate artists={artists}/>
          <PlaylistsTemplate playlists={playlists}/>
        </div>
      }
    </>
  )
}

export default SearchResultPage
