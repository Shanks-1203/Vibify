import express, { Request, Response }  from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import path from 'path';
import admin from 'firebase-admin';
import cors from 'cors';
var bodyParser = require('body-parser')
import dotenv from 'dotenv';
import multer from 'multer';
import auth from '../middleware/authMiddleware';
const fs = require('fs');

const app = express();
const serviceAccount = require('../../serviceAccountKey.json');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(auth)

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'vibify-remastered.appspot.com'
});

const bucket = admin.storage().bucket();

const firestore = admin.firestore();

interface MyJwtPayload extends JwtPayload {
  userId: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const multipleUpload = upload.fields([
  { name: 'song', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]);


//Get artists in home page
app.get('/home-artists', async(req, res) => {
    try {
      const artists = firestore.collection('artists')

      const snapshot = await artists.get();
      
      const artistData = await Promise.all(
        snapshot.docs.map(async (artistDoc) => {
          const artistData = artistDoc.data();

          const extensions = ['jpg', 'jpeg', 'png'];
          let profileURL;

          for (const ext of extensions){

            const file = bucket.file(`user-profile/${artistData.user_id}.${ext}`);
            
            try{
              await file.getMetadata();
              const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491',
              });
              profileURL = url
            } catch(err) {
              continue;
            }
          }


          const profile = await firestore.collection('userList').doc(artistData.user_id).get();
          const username = profile.data()?.username ?? 'Unknown';
  
          return { profileURL, artistId: artistDoc.id, followers: artistData.followers, artistName: username};
        })
      );

      res.status(200).send(artistData);

    } catch (err) {
      console.error(err);
      res.status(500).send();
    }
});


// Artist details page
app.get('/artist/:artistId', async(req, res) => {

  const {artistId} = req.params
  const userId = req.headers['userId'] as string;

  try{
    const artistDoc = await firestore.collection('artists').doc(artistId).get();

    let artistDetails = {
      artistProfile: '',
      artistId,
      artistName: 'Musical Doe',
      followers: 1000
    }

    let songs = [] as {songId: string, songName: string, duration:number}[]

    if(artistDoc.exists){
      const {user_id, followers} = artistDoc.data() as {user_id: string, followers:number}
      const artistName = (await firestore.collection('userList').doc(user_id).get()).data()?.username;

      const extensions = ['jpeg', 'jpg', 'png'];
      let profileUrl = '';

      for (const ext of extensions) {
        const profilePic = bucket.file(`user-profile/${user_id}.${ext}`)

        try{
          const file = await profilePic.getMetadata();
          const [url] = await profilePic.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
          });
          profileUrl = url
          break;
        } catch(err) {
          continue
        }
      }

      artistDetails = { artistProfile: profileUrl, artistId, artistName, followers }

      const songFetch = await firestore.collection('songs').where('artist_id','==', artistId).get()

      if(!songFetch.empty){
        songs = await Promise.all(
          songFetch.docs.map(async(doc) => {
            const {song_name, duration} = doc.data();
            let isLiked = false;

            if(userId){
              const likes = await firestore.collection('song-likes')
              .where('song_id','==', doc.id)
              .where('user_id','==', userId)
              .get()

              isLiked = !likes.empty
            }

            return {songId: doc.id, songName: song_name, duration, isLiked}
          })
        )
      }

      res.status(200).json({artistDetails, songs})

    } else {
      res.status(404).send('Artist not found')
    }


  } catch(err) {
    console.error(err)
    res.status(500).send('Internal server error')
  }
});


//Get songs in home page
app.get('/home-songs', async(req:Request, res:Response) => {

  const userId = req.headers['userId'] as string;

  try {
    const song = firestore.collection('songs');
    const snapshot = await song.get();

    const songData = await Promise.all(
      snapshot.docs.map(async(song)=>{
        const songId = song.id;
        const songDetails = song.data();
        let isLiked = false;        

        if (userId) {
          const likeSnapshot = await firestore.collection('song-likes')
            .where('user_id', '==', userId)
            .where('song_id', '==', songId)
            .get();

          isLiked = !likeSnapshot.empty;
        }

        const artistId = (await firestore.collection('artists').doc(songDetails.artist_id).get()).data()?.user_id
        const artistName = (await firestore.collection('userList').doc(artistId).get()).data()?.username
        return {songId:songId, songName:songDetails.song_name, artistId:songDetails.artist_id, artistName:artistName, duration: songDetails.duration, isLiked}
      })
    )

    res.status(200).send(songData);
  } catch(err) {
    console.log(err);
    res.status(500).send();
  }

});


//Add songs to playlist
app.post('/saveToPlaylist', async (req, res) => {
  
  const { selectedPlaylists, songId } = req.body;
  const userId = req.headers['userId'] as string;
  
  if(!userId){
    return res.status(401).send('Login for this action');
  }

  if (!selectedPlaylists || selectedPlaylists.length === 0 || !songId) {
    return res.status(400).send({ error: 'Invalid input: selectedPlaylists and songId are required' });
  }

  try {

    const checkPromises = selectedPlaylists.map(async (playlistId:string) => {

      const playlistOwner = (await firestore.collection('playlists').doc(playlistId).get()).data()?.user_id

      if(userId === playlistOwner){
        const snapshot = await firestore.collection('playlist-songs')
          .where('playlist_id', '==', playlistId)
          .where('song_id', '==', songId)
          .get();
  
        return { playlistId, exists: !snapshot.empty, hasPermission: true };
      } else {
        return { playlistId, exists: false, hasPermission: false };
      }
    });

    const results = await Promise.all(checkPromises);

    const unauthorizedPlaylists = results.filter(result => !result.hasPermission);
    if (unauthorizedPlaylists.length > 0) {
      return res.status(401).send("You don't have permission to add a song to playlists");
    }

    const existingPlaylists = results.filter(result => result.exists).map(result => result.playlistId);
    const newPlaylists = results.filter(result => !result.exists).map(result => result.playlistId);

    if (existingPlaylists.length === selectedPlaylists.length) {
      return res.status(409).send('Song already exists in all selected playlists');
    }

    const addPromises = newPlaylists.map(playlistId => {
      return firestore.collection('playlist-songs').add({
        playlist_id: playlistId,
        song_id: songId,
      });
    });

    await Promise.all(addPromises);

    res.status(200).send('Song added to playlists successfully');

  } catch(err) {
    console.log(err);
    res.status(500).send('Internal server error')    
  }
});


//Remove song from playlist
app.post('/removeFromPlaylist', async(req,res)=>{
  const {playlistId, songId} = req.body;
  const userId = req.headers['userId'] as string;

  if(!userId){
    return res.status(401).send('Login for this action');
  }

  if (!playlistId || !songId) {
    return res.status(400).send({ error: 'Invalid input: playlistId and songId are required' });
  }

  try {
    const song = await firestore.collection('playlist-songs')
    .where('playlist_id','==', playlistId)
    .where('song_id','==', songId)
    .get()

    if(song.empty){
      return res.status(404).send('Song not found in playlist');
    } else {
      const deletePromises = song.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);

      res.status(200).send('song removed from playlist successfully');
    }
  } catch(err) {
    console.log(err);
    res.status(500).send('Internal server error')
  }
})


//Get playlists in home page
app.get('/home-playlists', async(req,res)=> {

  const userId = req.headers['userId'] as string;

  try{
    let list = [];
    const playlists = await firestore.collection('playlists').get()

    list = await Promise.all(
      playlists.docs.map(async(doc)=>{
        const detail = doc.data();

        const trackCount = (await firestore.collection('playlist-songs').where('playlist_id','==', doc.id).get()).size

        return {playlistId : doc.id, playlistName: detail.playlist_name, likes: detail.likes, trackCount}
      })
    )

    res.status(200).send(list);
  } catch(err) {
    console.log(err)
    res.status(500).send('Internal server error')
  }

})

//get song from firebase
app.get('/song/:songId', async (req, res) => {
  const { songId } = req.params;

  try {
    const prefix = `songs/${songId}/`;

    const [files] = await bucket.getFiles({ prefix });
    let lyricsText;

    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Files not found' });
    }

    let urls:{mp3:string|null, cover:string|null, lyrics:string|null} = {
      mp3:null,
      cover:null,
      lyrics:null
    };

    for (const file of files) {
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491',
      });

      const extension = file.name.split('.').pop()?.toLowerCase();
      if(extension==='mp3'){
        urls.mp3 = url;
      } else if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'jfif'){
        urls.cover = url
      } else if (extension === 'txt') {
        const [buffer] = await file.download();
        const lyrics = buffer.toString('utf8');
        urls.lyrics = lyrics;
      }
    }

    res.status(200).send(urls);
  } catch (error) {
    console.error('Error fetching file URLs:', error);
    res.status(500).send('Internal server error');
  }
});


//Get song cover from firebase
app.get('/songCover/:songId', async (req, res) => {
  const { songId } = req.params;

  try {
    const prefix = `songs/${songId}/`;

    const [files] = await bucket.getFiles({ prefix });

    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Files not found' });
    }

    let coverUrl;

    for (const file of files) {
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491',
      });

      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'png' || extension === 'jpg' || extension === 'jpeg'){
        coverUrl = url
      }
    }

    res.status(200).send(coverUrl);
  } catch (err) {
    console.log(err);
    res.status(500).send(err)
  }
})


//Upload folder to firebase
// app.post('/upload', multipleUpload, async(req: any, res: any) => {

//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if(token){
//     try {
//       const decoded:any = jwt.verify(token, JWT_SECRET);
//       const userId = decoded.userId;
//       const result = await query('SELECT * FROM "Artist" WHERE "UserId"=$1',[userId]);
      
//       if(result.rowCount && result.rowCount>0){
//         const song = req.files.song[0];
//         const image = req.files.coverImage[0];
//         const {songName, duration, lyrics} = req.body;
//         const artistId = result.rows[0].ArtistId;

//         const upload = await query('INSERT INTO "Songs"("artistId", "songName", "duration", "lyrics") VALUES ($1, $2, $3, $4) RETURNING "songId"', [artistId, songName, duration, lyrics])

//         if(upload.rowCount && upload.rowCount>0){
//           const songId = upload.rows[0].songId;

//           const songBlob = bucket.file(`${songId}/${song.originalname}`);
//           const imageBlob = bucket.file(`${songId}/${image.originalname}`);

//           const songUpload = songBlob.createWriteStream({
//             metadata: {
//               contentType: song.mimetype,
//             },
//           });

//           const imageUpload = imageBlob.createWriteStream({
//             metadata: {
//               contentType: image.mimetype,
//             },
//           });

//           const uploads = [
//             new Promise((resolve, reject) => {
//               songUpload.on('error', reject);
//               songUpload.on('finish', resolve);
//               songUpload.end(song.buffer);
//             }),
//             new Promise((resolve, reject) => {
//               imageUpload.on('error', reject);
//               imageUpload.on('finish', resolve);
//               imageUpload.end(image.buffer);
//             })
//           ];

//           await Promise.all(uploads);

//           return res.status(200).send('Files uploaded successfully.');
//         }
        
//       } else {
//          return res.status(403).send('You are not an artist.');
//       }

//     } catch(err) {
//       console.log(err);
//       res.status(500).send('Error: ', err);
//     }
    
//   } else {
//     res.status(401).send('No token provided.');
//   }
// });


//edit user profile
app.post('/edit/profile', upload.single('profilePicture'), async(req,res)=>{

  const userId = req.headers['userId'] as string;
  const {userName} = req.body
  const profileBuffer = req.file ? req.file.buffer : null;

  if(!userId) {
    return res.status(401).send('Login for this action');
  }

  try {

    if(userName){
      const userdoc = firestore.collection('userList');
      const existingName = await userdoc.where('username','==',userName).get();

      if(existingName.empty){
        await userdoc.doc(userId).update({ username: userName })
        res.status(200).send('Profile Updated successfully');
      } else {
        res.status(409).send('Name already exists');
      }
    }
    
    if(profileBuffer){
      const extensions = ['jpeg', 'png', 'jpg'];

      for (const ext of extensions) {
        const profilePic = bucket.file(`user-profile/${userId}.${ext}`)

        try{
          await profilePic.delete();          
          break;
        } catch(err) {
          continue
        }
      }

      const fileExtension = req.file?.originalname ? path.extname(req.file.originalname) : '.jpg';
      const newFileName = `user-profile/${userId}${fileExtension}`;
      const file = bucket.file(newFileName);
      await file.save(profileBuffer, {
        metadata: { contentType: req.file?.mimetype }
      });
        
      res.status(200).send('Profile picture updated successfully');
    }

    if(!userName && !profileBuffer){
      res.status(200).send('No changes')
    }

  } catch(err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
})


//Get user profile
app.get('/profile', async(req,res)=>{
  
  const userId = req.headers['userId'] as string;

  if(!userId) {
    return res.status(401).send('Login to view profile');
  }

  try{
    const user = await firestore.collection('userList').doc(userId).get()

    if(user.exists){
      const userName = user.data()?.username;
      const extensions = ['jpeg', 'png', 'jpg'];
      let profileUrl = null;

      for (const ext of extensions) {
        const profilePic = bucket.file(`user-profile/${userId}.${ext}`)

        try{
          const file = await profilePic.getMetadata();
          const [url] = await profilePic.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
          });
          profileUrl = url
          break;
        } catch(err) {
          continue
        }
      }

      return res.status(200).send({ userName, profileUrl });

    } else {
      return res.status(404).send('User not found');
    }
  } catch(err) {
    console.log(err);
    res.status(500).send(err);
  }
})


//Get Pinned Playlist in sidebar
app.get('/pins', async(req,res)=>{

  const userId = req.headers['userId'] as string;
  let list = [];

  if(!userId) {
    return res.status(200).send([]);
  }

  try{
    const pinlist = await firestore.collection('pinlist').where('user_id','==', userId).get();

    list = await Promise.all(
      pinlist.docs.map(async(doc)=>{
        const {playlist_id} = doc.data();

        const playlistName = (await firestore.collection('playlists').doc(playlist_id).get())?.data()?.playlist_name;

        return {playlistId: playlist_id, playlistName};
      })
    )

    res.status(200).send(list)
  } catch(err) {
    console.log(err);
    res.status(500).send('Internal Server error');
  }
})


//Create playlist
app.post('/create/playlist',async(req,res)=>{

  const {playlistName} = req.body
  const userId = req.headers['userId'] as string;

  if(!userId){
    res.status(401).send('Login for this action')
  }
  
  try{
    if(!playlistName){
      res.status(400).send('Playlist name required')
    } else {
      const createPlaylist = await firestore.collection('playlists').add({
        playlist_name: playlistName,
        user_id: userId
      })
  
      const newId = createPlaylist.id

      const addToLibrary = await firestore.collection('library-playlists').add({
        playlist_id: newId,
        user_id: userId
      })
      
      res.status(200).send('Playlist created successfully')
    }
  } catch(err) {
    console.log(err)
    res.status(500).send(err)
  }
})

//Like playlist
app.post('/like/playlist', async(req,res)=>{
  const userId = req.headers['userId'] as string;
  const {playlistId} = req.body

  if(!userId){
    res.status(401).send('Login for this action');
  }

  try{
    const addToLibrary = await firestore.collection('library-playlists').add({
      playlist_id: playlistId,
      user_id: userId
    })
    res.status(200).send('Playlist Liked')
  } catch(err) {
    console.log(err)
    res.status(500).send('Internal Server error')
  }
})


//Get playlist details
app.get('/playlists/:playlistId', async(req,res)=>{

  const {playlistId} = req.params
  const userId = req.headers['userId'] as string;

  try {

    const playlist = await firestore.collection('playlists').doc(playlistId).get()
    
    let playlistDetails = {
      playlistId: playlistId,
      playlistName: 'Vibify',
      creatorId: "none",
      creatorName: 'none',
      likes: 0,
      isLiked: false
    }

    let songs: {songId: string, songName: string, duration: number, artistName: string}[] = [];

    if(!playlist.exists){
      res.status(404).send('Playlist not found')
    } else {
      const playlistData = playlist?.data() as { playlist_name: string; user_id: string; };
      
      if (playlistData) {
        const { playlist_name, user_id } = playlistData;
        const userName = (await firestore.collection('userList').doc(user_id).get()).data()?.username;
        const likes = (await firestore.collection('library-playlists').where('playlist_id','==',playlistId).get()).size
        const isLiked = await firestore.collection('library-playlists')
        .where('playlist_id','==',playlistId)
        .where('user_id', '==', userId).get()
      
        playlistDetails = { playlistId ,playlistName:playlist_name, creatorId:user_id, creatorName:userName, likes, isLiked: !isLiked.empty }
      }

      const songFetch = await firestore.collection('playlist-songs').where('playlist_id', '==', playlistId).get()

      songs = await Promise.all(
        songFetch.docs.map(async(doc) => {
          const { artist_id, duration, song_name } = (await firestore.collection('songs').doc(doc.data().song_id).get()).data() as {artist_id: string, duration: number, song_name:string};
          let isLiked = false;

          const artistUserId = (await firestore.collection('artists').doc(artist_id).get()).data()?.user_id;
          const artistName = (await firestore.collection('userList').doc(artistUserId).get()).data()?.username;

          if(userId){
            const userLiked = await firestore.collection('song-likes')
            .where('user_id', '==', userId)
            .where('song_id', '==', doc.data()?.song_id)
            .get()            

            isLiked = !userLiked.empty
          }

          return {songId: doc.data()?.song_id, songName: song_name, duration, artistId: artist_id, artistName, isLiked}
        })
      )
    }
    res.status(200).json({playlistDetails, songs});


  } catch(err) {
    console.log(err)
    res.status(500).send('Internal server error')
  }
})


//Get favorite songs
app.get('/favorites', async(req,res)=>{

  const userId = req.headers['userId'] as string;

  if(!userId){
    res.status(401).send('Login for this action')
  }

  try {
    const favorites = await firestore.collection('song-likes')
    .where('user_id','==', userId)
    .get()

    if(favorites.empty){
      res.status(200).send([])
    } else {
      const favoritesArray = await Promise.all(
        favorites.docs.map(async(doc) => {
          const songId = doc.data()?.song_id;
          const songDetails = (await firestore.collection('songs').doc(songId).get()).data()

          const artistId = songDetails?.artist_id
          const artistUserId = (await firestore.collection('artists').doc(artistId).get()).data()?.user_id

          const artistName = (await firestore.collection('userList').doc(artistUserId).get()).data()?.username
          return { songId, songName: songDetails?.song_name, artistId, artistName, duration: songDetails?.duration }
        })
      )
      res.status(200).send(favoritesArray);
    }

  } catch(err) {
    console.log(err)
    res.status(500).send(err)
  }
  
})


//Like song
app.post('/like/:songId', async(req,res)=>{
  const song_id = req.params.songId
  const user_id = req.headers['userId'] as string;

  if(!user_id){
    res.status(401).send('Login for this action')
  }

  try{
    const songLike = await firestore.collection('song-likes')
    .where('song_id', '==', song_id)
    .where('user_id', '==', user_id)
    .get();

    const like = songLike.docs[0];

    if(like){
      res.status(200).send('Song already in favorites');
    } else {

      const songLike = await firestore.collection('song-likes').add({
        song_id,
        user_id
      });
        
      res.status(200).send('Song added to favorites');
    }
  } catch(err) {
    console.log(err);
    res.status(500).send(err)
  }
})


//Unlike song
app.delete('/like/:songId', async (req: Request, res: Response) => {
  const song_id = req.params.songId;
  const user_id = req.headers['userId'] as string;

  if (!user_id) {
    return res.status(401).send('Login for this action');
  }

  try {
    const querySnapshot = await firestore.collection('song-likes')
      .where('song_id', '==', song_id)
      .where('user_id', '==', user_id)
      .get();

    if (querySnapshot.empty) {
      return res.status(404).send('Like not found');
    }

    const deletePromises = querySnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    res.status(200).send('Like removed successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});


// Login api
app.post('/login', async(req,res)=>{
  
  try{

    const { loginCredential, password } = req.body
    
    if (!loginCredential || !password) {
      return res.status(400).send('Email/Username and Password are required');
    }
    
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>;

    if (loginCredential.includes('@')) {
      query = firestore.collection('userList').where('email', '==', loginCredential);
    } else {
      query = firestore.collection('userList').where('username', '==', loginCredential);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(404).send('User not found');
    }

    const user = snapshot.docs[0].data();
    const userId = snapshot.docs[0].id;
    const validPassword = await bcrypt.compare(password, user.password);
    
    if(validPassword) {
      const token = jwt.sign({ userId: userId }, JWT_SECRET, {
         expiresIn: '100h'
      });
      res.status(200).send({ token });
    } else {
      res.status(401).send('Password not match')
    }
  } catch(err:any){
    res.status(500).send('Internal Server Error');
  }
})


//signup api
app.post('/signup', async(req,res)=>{

  try{
    const {username, email, password} = req.body;

    if (!username || !password || !email) {
      return res.status(400).send('Email, Username and Password are required');
    }
    
    const user = firestore.collection('userList').where('email', '==', email);
    const userWithName = firestore.collection('userList').where('user_name', '==', username);

    const snapshot = await user.get();
    const snapshotWithName = await userWithName.get();

    if (!snapshot.empty) {
      return res.status(404).send('Email already exists');
    }

    if(!snapshotWithName.empty){
      res.status(409).send('Username already exist');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRef = await firestore.collection('userList').add({
      username,
      email,
      password: hashedPassword,
    });

    res.status(200).send('User saved successfully');
  } catch(err){
    console.log(err);
    res.status(500).send();
  }
})

app.get('/home', async(req, res)=>{
  
})


//Backend server port
app.listen('8080',()=>{
    console.log('Server is running on port 8080');
})