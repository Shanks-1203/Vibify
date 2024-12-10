export interface Song {
    ArtistName: string
    PlaylistId: number
    PlaylistName: string
    PlaylistLikes: number
    UserName: string
    artistId: number
    duration: number
    songId: string
    songName: string
    lyrics: string
    isLiked: boolean
}

export interface SimpleSongType {
  coverUrl: string
  songId: string
  songName: string
  artistId: string
  artistName: string
  duration: number
  // lyrics: string
  isLiked:boolean
}

export interface QueueState {
    musicQueue: {
        Queue: SimpleSongType[]
        shuffledQueue: SimpleSongType[]
        playIndex: number
    }
}

export interface playlistDetails {
  playlistId: string,
  playlistName: string,
  creatorId: string,
  creatorName: string,
  likes: number,
  isLiked:boolean
}

export interface musicPlayerState {
    musicPlayer: {
      song:{
        id: string,
        name:string,
        artist:string,
        urls: {
          mp3: string
          cover:string,
          lyrics: string | null,
        }
      }
      isLiked:boolean
      songLength: number,
      miniplayer:string,
      play:boolean,
      musicSeek:number,
      duration: number,
      shuffle:boolean,
      repeat:string
    };
}

export interface searchState {
  search: {
    keyword: string,
    search: boolean
  }
}

export type playlistType = {
  playlistId:string
  playlistName:string
  trackCount: number
};

export interface saveToPlaylist {
  saveToPlaylist: {
    popup:boolean,
    songId: number | null
    createPopup:boolean
  }
}

export interface addToQuickAccess {
  addToQuickAccess: {
    pins: {playlistId:string, playlistName: string}[]
    popup: boolean
  }
}

export interface artistSongs {
  songId: string
  songName: string
  duration: number
  isLiked: boolean
}

export interface artistDetails {
  artistId: string
  artistName: string
  artistProfile: string
  followers: number
  isFollowing: boolean
}

export interface profileDetails {
  profileDetails: {
    userProfileName:string | null,
    profilePic:string | null,
    isLoggedIn: boolean
  }
}

export interface artistType {
  artistId:number
  artistName:string
  followers: number
  profileURL: string
};

export interface homePageLoader {
  songsLoaded: boolean,
  artistsLoaded: boolean,
}

export interface libraryPlaylists {
    playlistId: string,
    playlistName: string,
    trackCount: number
}