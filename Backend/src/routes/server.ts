import express, { Request, Response }  from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import admin from 'firebase-admin';
import cors from 'cors';
var bodyParser = require('body-parser')
import dotenv from 'dotenv';
import multer from 'multer';
import auth from '../middleware/authMiddleware';

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

//Get artists in home page
app.get('/home-artists', async(req, res) => {
    try {
      const artists = firestore.collection('artists')

      const snapshot = await artists.get();
      
      const artistData = await Promise.all(
        snapshot.docs.map(async (artistDoc) => {
          const artistData = artistDoc.data();

          const file = bucket.file(`user-profile/${artistData.user_id}.jpg`);
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
          });

          const profile = await firestore.collection('userList').doc(artistData.user_id).get();
          const username = profile.data()?.username ?? 'Unknown';
  
          return { profileURL: url, artistId: artistDoc.id, followers: artistData.followers, artistName: username};
        })
      );

      res.status(200).send(artistData);

    } catch (err) {
      console.error(err);
      res.status(500).send();
    }
});


//Artist details page
// app.get('/artist/:artistId', async(req, res) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if(token){
//     try {
//       const decoded:any = jwt.verify(token, JWT_SECRET);
//       const userId = decoded.userId;

//       const result = await query('SELECT a.*, s."songId", s."songName", s."duration", s."lyrics", u."ProfilePicture", CASE WHEN sl."songid" IS NOT NULL THEN TRUE ELSE FALSE END AS "isLiked" FROM "Artist" a JOIN "Songs" s ON a."ArtistId" = s."artistId" LEFT JOIN "SongLikes" sl ON s."songId" = sl."songid" AND sl."userid" = $1 JOIN "UserList" u ON a."UserId" = u."UserId" WHERE a."ArtistId" = $2;',[userId, req.params.artistId]);
      
//       const processedRows = result.rows.map(row => {
//         if (row.ProfilePicture) {
//             row.ProfilePicture = row.ProfilePicture.toString('base64');
//         }
//         return row;
//       });

//       res.status(200).send(processedRows);

//     } catch (err) {
//       console.error(err);
//       res.status(500).send();
//     }
//   } else {
//     try{
//       const result = await query('SELECT a.*, s."songId", s."songName", s."duration", s."lyrics", u."ProfilePicture" FROM "Artist" a JOIN "Songs" s ON a."ArtistId" = s."artistId" JOIN "UserList" u ON a."UserId" = u."UserId" WHERE a."ArtistId" = 1',[req.params.artistId]);
      
//       const processedRows = result.rows.map(row => {
//         if (row.ProfilePicture) {
//             row.ProfilePicture = row.ProfilePicture.toString('base64');
//         }
//         return row;
//       });

//       res.status(200).send(processedRows);

//     } catch(err){
//       console.error(err);
//       res.status(500).send();
//     }
//   }
// });


//Get songs in home page
app.get('/home-songs', async(req:Request, res:Response) => {

  const userId = req?.body?.userId;

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
        return {songId:songId, songName:songDetails.song_name, artistName:artistName, duration: songDetails.duration, isLiked}
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
  
  const { selectedPlaylists, songId, userId } = req.body;  

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


// //Remove song from playlist
// app.post('/removeFromPlaylist', async(req,res)=>{
//   const {playlistId, songId} = req.body;

//   if (!playlistId || !songId) {
//     return res.status(400).send({ error: 'Invalid input: selectedPlaylists and songId are required' });
//   }

//   try{
//     const result = await query(
//       'DELETE FROM "PlaylistDetails" WHERE "playlistId" = $1 AND "songId" = $2 RETURNING *',
//       [playlistId, songId]
//     );

//     if (result.rowCount && result.rowCount > 0) {
//       return res.status(200).send('Song removed from playlist successfully');
//     } else {
//       return res.status(404).send({ error: 'Song not found in the specified playlist' });
//     }
//   } catch(err) {
//     console.error(err);
//     return res.status(500).send({ error: 'An error occurred while removing the song from playlists' });
//   }
// })

// //Get playlists in home page
// app.get('/home-playlists', async(req,res)=> {

//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     try {  
//       const result = await query('SELECT pl."Id" AS "playlistId", pl."Name" AS "playlistName", COUNT(pd."songId") AS trackCount FROM "Playlist" pl LEFT JOIN "PlaylistDetails" pd ON pl."Id" = pd."playlistId" GROUP BY pl."Id", pl."Name"');
//       res.status(200).send(result.rows);
//     } catch(err) {
//       console.error(err);
//       res.status(500).send();
//     }
//   }

//   else {
//     try {
//       const decoded:any = jwt.verify(token, JWT_SECRET);
//       const result = await query('SELECT pl."Id" AS "playlistId", pl."Name" AS "playlistName", COUNT(pd."songId") AS trackCount FROM "Playlist" pl LEFT JOIN "PlaylistDetails" pd ON pl."Id" = pd."playlistId" WHERE pl."CreatorId" = $1 GROUP BY pl."Id", pl."Name"',[decoded.userId]);
//       res.status(200).send(result.rows);
//     } catch(err:any) {
//       if(err.name === 'TokenExpiredError'){
//         res.status(401).send('Token expired');
//       }
//       console.error(err);
//       res.status(500).send();
//     }
//   }

// })

//get song from firebase
app.get('/song/:songId', async (req, res) => {
  const { songId } = req.params;

  try {
    const prefix = `songs/${songId}/`;

    const [files] = await bucket.getFiles({ prefix });

    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Files not found' });
    }

    let urls:{mp3:string|null, cover:string|null} = {
      mp3:null,
      cover:null
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


// //Upload folder to firebase
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
// const multipleUpload = upload.fields([
//   { name: 'song', maxCount: 1 },
//   { name: 'coverImage', maxCount: 1 }
// ]);
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

// //edit user profile
// app.post('/edit/profile', upload.single('profilePicture'), async(req,res)=>{
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if(token){
//     try{
//       const decoded:any = jwt.verify(token, JWT_SECRET);
//       const userId = decoded.userId;
//       const {userName} = req.body;

//       const profileBuffer = req.file ? req.file.buffer : null;

//       const result = await query('UPDATE "UserList" SET "ProfilePicture" = $1, "UserName" = $2 WHERE "UserId" = $3',[profileBuffer, userName, userId]);
//       res.status(200).send('Profile Updated Successfully');
//     } catch(err){
//       console.log(err);
//       res.status(500).send(err)
//     }
//   } else {
//     res.status(401).send('unauthorized');
//   }
// })

// //Get user profile
// app.get('/profile', async(req,res)=>{
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if(token){
//     try{
//       const decoded:any = jwt.verify(token, JWT_SECRET);
//       const userId = decoded.userId;

//       const result = await query('SELECT "UserName", "ProfilePicture" FROM "UserList" WHERE "UserId" = $1',[userId])
//       const user = result.rows[0];
//       const profilePicBuffer = user.ProfilePicture;

//       if(profilePicBuffer){
//         res.json({
//              userName: user.UserName,
//              profilePic: profilePicBuffer.toString('base64')
//          });
//       } else {
//         res.json({
//           userName: user.UserName,
//           profilePic: null
//       });
//       }
//     } catch(err) {
//       console.log(err);
//       res.status(500).send(err);
//     }
//   } else {
//     res.status(401).send('unauthorized');
//   }
// })

// //Get Pinned Playlist in sidebar
// app.get('/pins', async(req,res)=>{
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if(token){
//     try{
//       const decoded:any = jwt.verify(token, JWT_SECRET);
//       const userId = decoded.userId;

//       const result = await query('SELECT pl."pinPlaylist" AS "id", p."Name" AS "name" FROM "PinList" pl JOIN "Playlist" p ON pl."pinPlaylist" = p."Id" WHERE pl."pinUser" = $1',[userId]);
//       res.status(200).send(result.rows);
//     } catch(err) {
//       console.log(err);
//       res.status(500).send(err);
//     }
//   } else {
//     res.status(401).send('unauthorized');
//   }
// })

//Create playlist
app.post('/create/playlist',async(req,res)=>{

  const {playlistName, userId} = req.body

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

// //Get playlist details
// app.get('/playlists/:playlistId', async(req,res)=>{
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if(token){
//     try {
//       const decoded:any = jwt.verify(token, JWT_SECRET);
//       const userId = decoded.userId;

//       const result = await query('SELECT p."Id" AS "PlaylistId", p."Name" AS "PlaylistName", p."Likes" AS "PlaylistLikes", s.*, a."ArtistName", u."UserName", CASE WHEN sl."songid" IS NOT NULL THEN TRUE ELSE FALSE END AS "isLiked" FROM public."Playlist" AS p LEFT JOIN public."PlaylistDetails" AS pd ON p."Id" = pd."playlistId" LEFT JOIN public."Songs" AS s ON pd."songId" = s."songId" LEFT JOIN public."Artist" AS a ON s."artistId" = a."ArtistId" LEFT JOIN public."UserList" AS u ON p."CreatorId" = u."UserId" LEFT JOIN public."SongLikes" AS sl ON s."songId" = sl."songid" AND sl."userid" = $1 WHERE p."Id" = $2 ORDER BY pd."id" DESC',[userId, req.params.playlistId]);
//       res.status(200).send(result.rows);
//     } catch(err) {
//       console.error(err);
//       res.status(500).send();
//     }
//   } else {
//     try {
//       const result = await query('SELECT p."Id" AS "PlaylistId", p."Name" AS "PlaylistName", p."Likes" AS "PlaylistLikes", s.*, a."ArtistName", u."UserName" FROM public."Playlist" AS p LEFT JOIN public."PlaylistDetails" AS pd ON p."Id" = pd."playlistId" LEFT JOIN public."Songs" AS s ON pd."songId" = s."songId" LEFT JOIN public."Artist" AS a ON s."artistId" = a."ArtistId" LEFT JOIN public."UserList" AS u ON p."CreatorId" = u."UserId" WHERE p."Id" = $1 ORDER BY pd."id" DESC',[req.params.playlistId]);
//       res.status(200).send(result.rows);
//     } catch(err) {
//       console.error(err);
//       res.status(500).send();
//     }
//   }
// })

//Get favorite songs
app.get('/favorites', async(req,res)=>{

  const { userId } = req.body

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
          return { song_name: songDetails?.song_name, artist_name: artistName, duration: songDetails?.duration }
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
  const user_id = req?.body?.userId;

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
  const user_id = req.body.userId;

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
         expiresIn: '10h'
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

//Backend server port
app.listen('8080',()=>{
    console.log('Server is running on port 8080');
})