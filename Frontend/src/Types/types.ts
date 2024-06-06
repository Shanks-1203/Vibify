export interface Song {
    ArtistName: String
    PlaylistId: number
    PlaylistName: String
    PlaylistLikes: number
    UserName: String
    artistId: number
    duration: number
    songId: number
    songName: String
    lyrics: String
    isLiked: Boolean
}

export interface SimpleSongType {
  songId: number
  songName: String
  artistId: number
  ArtistName: String
  duration: number
  lyrics: String
  isLiked:Boolean
}

export interface QueueState {
    musicQueue: {
        Queue: Song[]
        shuffledQueue: Song[]
        playIndex: number
    }
}

export interface musicPlayerState {
    musicPlayer: {
      song:{
        id: number,
        name:String,
        artist:String,
        lyrics: String,
        urls: {
          mp3: string
          cover:string
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
  playlistId:number
  playlistName:String
  trackcount: number
};

export interface saveToPlaylist {
  saveToPlaylist: {
    popup:Boolean,
    songId: number | null
    createPopup:Boolean
  }
}

export interface artistSongs {
  ArtistId:number, 
  ArtistName:String, 
  FollowersCount: number, 
  songId:number, 
  songName:String, 
  duration:number,
  lyrics:String,
  isLiked: Boolean,
  ProfilePicture: string,
  UserId:number
}

export interface profileDetails {
  profileDetails: {
    userProfileName:String | null,
    profilePic:string | null
  }
}

export type artistType = {
  ArtistId:number
  ArtistName:String
  FollowersCount: number
  UserId:number
  ProfilePicture:Buffer
};