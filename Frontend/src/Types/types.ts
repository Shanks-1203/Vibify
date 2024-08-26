export interface Song {
    ArtistName: String
    PlaylistId: number
    PlaylistName: String
    PlaylistLikes: number
    UserName: String
    artistId: number
    duration: number
    songId: string
    songName: String
    lyrics: String
    isLiked: Boolean
}

export interface SimpleSongType {
  songId: string
  songName: string
  artistId: string
  artistName: String
  duration: number
  // lyrics: String
  isLiked:Boolean
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
        name:String,
        artist:String,
        urls: {
          mp3: string
          cover:string,
          lyrics: string | null,
        }
      }
      isLiked:Boolean
      songLength: number,
      miniplayer:String,
      play:Boolean,
      musicSeek:number,
      duration: number,
      shuffle:Boolean,
      repeat:String
    };
}

export type playlistType = {
  playlistId:string
  playlistName:String
  trackCount: number
};

export interface saveToPlaylist {
  saveToPlaylist: {
    popup:Boolean,
    songId: number | null
    createPopup:Boolean
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
    userProfileName:String | null,
    profilePic:string | null,
    isLoggedIn: boolean
  }
}

export interface artistType {
  artistId:number
  artistName:String
  followers: number
  profileURL: string
};

export interface homePageLoader {
  songsLoaded: boolean,
  artistsLoaded: boolean,
  playlistsLoaded: boolean
}