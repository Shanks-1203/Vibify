export interface Song {
    ArtistName: String
    PlaylistId: number
    PlaylistName: String
    UserName: String
    artistId: number
    duration: number
    songId: number
    songName: String
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
        artist:String
        mp3:string
      }
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
  }
}