import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import admin from 'firebase-admin';
import cors from 'cors';
import query from './db'
var bodyParser = require('body-parser')
import dotenv from 'dotenv';
import multer from 'multer';

const app = express();
const serviceAccount = require('../../../Users/Divum/Documents/serviceAccountKey.json');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'vibify-b0716.appspot.com'
});

const bucket = admin.storage().bucket();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

//Get artists in home page
app.get('/home-artists', async(req, res) => {
    try {
      const result = await query('SELECT a.*, u."ProfilePicture" FROM "Artist" a JOIN "UserList" u ON a."UserId" = u."UserId"');
      
      const processedRows = result.rows.map(row => {
        if (row.ProfilePicture) {
            row.ProfilePicture = row.ProfilePicture.toString('base64');
        }
        return row;
      });

      res.status(200).send(processedRows);

    } catch (err) {
      console.error(err);
      res.status(500).send();
    }
});


//Artist details page
app.get('/artist/:artistId', async(req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(token){
    try {
      const decoded:any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      const result = await query('SELECT a.*, s."songId", s."songName", s."duration", s."lyrics", u."ProfilePicture", CASE WHEN sl."songid" IS NOT NULL THEN TRUE ELSE FALSE END AS "isLiked" FROM "Artist" a JOIN "Songs" s ON a."ArtistId" = s."artistId" LEFT JOIN "SongLikes" sl ON s."songId" = sl."songid" AND sl."userid" = $1 JOIN "UserList" u ON a."UserId" = u."UserId" WHERE a."ArtistId" = $2;',[userId, req.params.artistId]);
      
      const processedRows = result.rows.map(row => {
        if (row.ProfilePicture) {
            row.ProfilePicture = row.ProfilePicture.toString('base64');
        }
        return row;
      });

      res.status(200).send(processedRows);

    } catch (err) {
      console.error(err);
      res.status(500).send();
    }
  } else {
    try{
      const result = await query('SELECT a.*, s."songId", s."songName", s."duration", s."lyrics", u."ProfilePicture" FROM "Artist" a JOIN "Songs" s ON a."ArtistId" = s."artistId" JOIN "UserList" u ON a."UserId" = u."UserId" WHERE a."ArtistId" = 1',[req.params.artistId]);
      
      const processedRows = result.rows.map(row => {
        if (row.ProfilePicture) {
            row.ProfilePicture = row.ProfilePicture.toString('base64');
        }
        return row;
      });

      res.status(200).send(processedRows);

    } catch(err){
      console.error(err);
      res.status(500).send();
    }
  }
});


//Get songs in home page
app.get('/home-songs', async(req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    try {  
      query('SELECT s.*, a."ArtistName" FROM "Songs" s JOIN "Artist" a ON s."artistId" = a."ArtistId"').then((result)=>{
      res.status(200).send(result.rows);
    })} 
    catch (err) {
      console.error(err);
      res.status(500).send();
    }
  }
  else{
    try {
      const decoded:any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;
  
      query('SELECT s.*, a."ArtistName", CASE WHEN sl."songid" IS NOT NULL THEN TRUE ELSE FALSE END AS "isLiked" FROM "Songs" s JOIN "Artist" a ON s."artistId" = a."ArtistId" LEFT JOIN "SongLikes" sl ON s."songId" = sl."songid" AND sl."userid" = $1',[userId]).then((result)=>{
      res.status(200).send(result.rows);
    })} 
    catch (err) {
      console.error(err);
      res.status(500).send();
    }
  }

});

//Add songs to playlist
app.post('/saveToPlaylist', async (req, res) => {
  const { selectedPlaylists, songId } = req.body;

  if (!selectedPlaylists || selectedPlaylists.length === 0 || !songId) {
    return res.status(400).send({ error: 'Invalid input: selectedPlaylists and songId are required' });
  }

  try {
    const present = await query(
      'SELECT "playlistId" FROM "PlaylistDetails" WHERE "songId" = $1 AND "playlistId" = ANY($2::int[])',
      [songId, selectedPlaylists]
    );

    const existingPlaylists = present.rows.map(row => row.playlistId);
    const newPlaylists = selectedPlaylists.filter((playlistId:Number) => !existingPlaylists.includes(playlistId));

    if (newPlaylists.length > 0) {
      const insertQuery = 'INSERT INTO "PlaylistDetails" ("playlistId", "songId") VALUES ($1, $2)';

      for (const playlistId of newPlaylists) {
        await query(insertQuery, [playlistId, songId]);
      }

      return res.status(200).send('Added successfully');
    } else {
      return res.status(200).send('Already exists in all selected playlists');
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'An error occurred while saving the song to playlists' });
  }
});


//Remove song from playlist
app.post('/removeFromPlaylist', async(req,res)=>{
  const {playlistId, songId} = req.body;

  if (!playlistId || !songId) {
    return res.status(400).send({ error: 'Invalid input: selectedPlaylists and songId are required' });
  }

  try{
    const result = await query(
      'DELETE FROM "PlaylistDetails" WHERE "playlistId" = $1 AND "songId" = $2 RETURNING *',
      [playlistId, songId]
    );

    if (result.rowCount && result.rowCount > 0) {
      return res.status(200).send('Song removed from playlist successfully');
    } else {
      return res.status(404).send({ error: 'Song not found in the specified playlist' });
    }
  } catch(err) {
    console.error(err);
    return res.status(500).send({ error: 'An error occurred while removing the song from playlists' });
  }
})

//Get playlists in home page
app.get('/home-playlists', async(req,res)=> {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    try {  
      const result = await query('SELECT pl."Id" AS "playlistId", pl."Name" AS "playlistName", COUNT(pd."songId") AS trackCount FROM "Playlist" pl LEFT JOIN "PlaylistDetails" pd ON pl."Id" = pd."playlistId" GROUP BY pl."Id", pl."Name"');
      res.status(200).send(result.rows);
    } catch(err) {
      console.error(err);
      res.status(500).send();
    }
  }

  else {
    try {
      const decoded:any = jwt.verify(token, JWT_SECRET);
      const result = await query('SELECT pl."Id" AS "playlistId", pl."Name" AS "playlistName", COUNT(pd."songId") AS trackCount FROM "Playlist" pl LEFT JOIN "PlaylistDetails" pd ON pl."Id" = pd."playlistId" WHERE pl."CreatorId" = $1 GROUP BY pl."Id", pl."Name"',[decoded.userId]);
      res.status(200).send(result.rows);
    } catch(err:any) {
      if(err.name === 'TokenExpiredError'){
        res.status(401).send('Token expired');
      }
      console.error(err);
      res.status(500).send();
    }
  }

})

//get song from firebase
app.get('/song/:songId', async (req, res) => {
  const { songId } = req.params;

  try {
    const bucket = admin.storage().bucket();
    const prefix = `${songId}/`;

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
    const bucket = admin.storage().bucket();
    const prefix = `${songId}/`;

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
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const multipleUpload = upload.fields([
  { name: 'song', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]);
app.post('/upload', multipleUpload, async(req: any, res: any) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(token){
    try {
      const decoded:any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;
      const result = await query('SELECT * FROM "Artist" WHERE "UserId"=$1',[userId]);
      
      if(result.rowCount && result.rowCount>0){
        const song = req.files.song[0];
        const image = req.files.coverImage[0];
        const {songName, duration, lyrics} = req.body;
        const artistId = result.rows[0].ArtistId;

        const upload = await query('INSERT INTO "Songs"("artistId", "songName", "duration", "lyrics") VALUES ($1, $2, $3, $4) RETURNING "songId"', [artistId, songName, duration, lyrics])

        if(upload.rowCount && upload.rowCount>0){
          const songId = upload.rows[0].songId;

          const songBlob = bucket.file(`${songId}/${song.originalname}`);
          const imageBlob = bucket.file(`${songId}/${image.originalname}`);

          const songUpload = songBlob.createWriteStream({
            metadata: {
              contentType: song.mimetype,
            },
          });

          const imageUpload = imageBlob.createWriteStream({
            metadata: {
              contentType: image.mimetype,
            },
          });

          const uploads = [
            new Promise((resolve, reject) => {
              songUpload.on('error', reject);
              songUpload.on('finish', resolve);
              songUpload.end(song.buffer);
            }),
            new Promise((resolve, reject) => {
              imageUpload.on('error', reject);
              imageUpload.on('finish', resolve);
              imageUpload.end(image.buffer);
            })
          ];

          await Promise.all(uploads);

          return res.status(200).send('Files uploaded successfully.');
        }
        
      } else {
         return res.status(403).send('You are not an artist.');
      }

    } catch(err) {
      console.log(err);
      res.status(500).send('Error: ', err);
    }
    
  } else {
    res.status(401).send('No token provided.');
  }
});

//edit user profile
app.post('/edit/profile', upload.single('profilePicture'), async(req,res)=>{
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(token){
    try{
      const decoded:any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;
      const {userName} = req.body;

      const profileBuffer = req.file ? req.file.buffer : null;

      const result = await query('UPDATE "UserList" SET "ProfilePicture" = $1, "UserName" = $2 WHERE "UserId" = $3',[profileBuffer, userName, userId]);
      res.status(200).send('Profile Updated Successfully');
    } catch(err){
      console.log(err);
      res.status(500).send(err)
    }
  } else {
    res.status(401).send('unauthorized');
  }
})

//Get user profile
app.get('/profile', async(req,res)=>{
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(token){
    try{
      const decoded:any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      const result = await query('SELECT "UserName", "ProfilePicture" FROM "UserList" WHERE "UserId" = $1',[userId])
      const user = result.rows[0];
      const profilePicBuffer = user.ProfilePicture;

      if(profilePicBuffer){
        res.json({
             userName: user.UserName,
             profilePic: profilePicBuffer.toString('base64')
         });
      } else {
        res.json({
          userName: user.UserName,
          profilePic: null
      });
      }
    } catch(err) {
      console.log(err);
      res.status(500).send(err);
    }
  } else {
    res.status(401).send('unauthorized');
  }
})

//Create playlist
app.post('/create/playlist',async(req,res)=>{

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(token){
    try{
      const decoded:any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;
      const {playlistName} = req.body

      const resp = await query('INSERT INTO "Playlist"("Name", "CreatorId") VALUES ($1, $2) RETURNING "Id"', [playlistName, userId])

      if(resp.rowCount && resp.rowCount>0){
        res.status(200).send('Playlist created successfully');
      }
    } catch(err){
      console.log(err);
      res.status(500).send(err);
    }
  }
})

//Get playlist details
app.get('/playlists/:playlistId', async(req,res)=>{
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(token){
    try {
      const decoded:any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      const result = await query('SELECT p."Id" AS "PlaylistId", p."Name" AS "PlaylistName", p."Likes" AS "PlaylistLikes", s.*, a."ArtistName", u."UserName", CASE WHEN sl."songid" IS NOT NULL THEN TRUE ELSE FALSE END AS "isLiked" FROM public."Playlist" AS p LEFT JOIN public."PlaylistDetails" AS pd ON p."Id" = pd."playlistId" LEFT JOIN public."Songs" AS s ON pd."songId" = s."songId" LEFT JOIN public."Artist" AS a ON s."artistId" = a."ArtistId" LEFT JOIN public."UserList" AS u ON p."CreatorId" = u."UserId" LEFT JOIN public."SongLikes" AS sl ON s."songId" = sl."songid" AND sl."userid" = $1 WHERE p."Id" = $2 ORDER BY pd."id" DESC',[userId, req.params.playlistId]);
      res.status(200).send(result.rows);
    } catch(err) {
      console.error(err);
      res.status(500).send();
    }
  } else {
    try {
      const result = await query('SELECT p."Id" AS "PlaylistId", p."Name" AS "PlaylistName", p."Likes" AS "PlaylistLikes", s.*, a."ArtistName", u."UserName" FROM public."Playlist" AS p LEFT JOIN public."PlaylistDetails" AS pd ON p."Id" = pd."playlistId" LEFT JOIN public."Songs" AS s ON pd."songId" = s."songId" LEFT JOIN public."Artist" AS a ON s."artistId" = a."ArtistId" LEFT JOIN public."UserList" AS u ON p."CreatorId" = u."UserId" WHERE p."Id" = $1 ORDER BY pd."id" DESC',[req.params.playlistId]);
      res.status(200).send(result.rows);
    } catch(err) {
      console.error(err);
      res.status(500).send();
    }
  }
})

//Get favorite songs
app.get('/favorites', async(req,res)=>{

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(token){
    try{
      const decoded:any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      const result = await query('SELECT s."songId", s."songName", s."artistId", a."ArtistName", s."duration", s."lyrics" FROM "SongLikes" sl JOIN "Songs" s ON sl."songid" = s."songId" JOIN "Artist" a ON s."artistId" = a."ArtistId" WHERE sl."userid" = $1 ORDER BY sl."id" DESC',[userId])
      res.status(200).send(result.rows);
      
    } catch(err){
      console.error(err);
    }
  } else {
    res.status(401).send('Token Missing');
  }
})

//Like song
app.post('/like/:songId', async(req,res)=>{
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if(token) {
    try{
      const decoded:any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      const resp = await query('INSERT INTO "SongLikes"("userid","songid") VALUES ($1, $2)',[userId, req.params.songId])
      res.status(200).send('Song liked');

    } catch(err) {
      console.error(err);
      res.status(500).send()
    }
  } else {
    res.status(401).send('Unauthorized')
  }
})

//Unlike song
app.delete('/unlike/:songId', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decoded:any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      const resp = await query('DELETE FROM "SongLikes" WHERE "userid" = $1 AND "songid" = $2', [userId, req.params.songId]);
      res.status(200).send('Song unliked');

    } catch (err) {
      console.error(err);
      res.status(500).send();
    }
  } else {
    res.status(401).send('Unauthorized');
  }
});

//Login api
app.post('/login', async(req,res)=>{
  
  try{

    const { loginCredential, password } = req.body

    const user = await query('SELECT * FROM "UserList" WHERE "email"=$1 OR "UserList"."UserName"=$1', [loginCredential]);

    if(user.rows.length>0){
      const userData = user.rows[0];

      const validPassword = await bcrypt.compare(password, userData.password);

      if(validPassword){
        const token = jwt.sign({ userId: userData.UserId }, JWT_SECRET, {
          expiresIn: '10h'
        });
        res.status(200).send({ token });
      } else {
        res.status(401).send('Password not match');
      }

    } else {
      res.status(404).send('User not found');
    }
  } catch(err:any){
    res.status(500).send('Internal Server Error');
  }
})


//signup api
app.post('/signup', async(req,res)=>{

  const {username, email, password} = req.body;  
  
  try{
    const user = await query('SELECT * FROM "UserList" WHERE "email"=$1', [email]);
    const userWithName = await query('SELECT * FROM "UserList" WHERE "UserName"=$1', [username]);

    if(user.rows.length>0){
      res.status(409).send('Email already exist');
    } else {
      if(userWithName.rows.length>0){
        res.status(409).send('Username already exist');
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const resp = await query(`INSERT INTO "UserList" ("UserName", "email", "password") VALUES ($1, $2, $3);`,[username, email, hashedPassword]);
        res.status(200).send('User saved successfully');
      }
    }
  } catch(err){
    console.log(err);
    res.status(500).send();
  }
})


//Backend server port
app.listen('8080',()=>{
    console.log('Server is running on port 8080');
})