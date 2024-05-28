import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import admin from 'firebase-admin';
import cors from 'cors';
import query from './db'
var bodyParser = require('body-parser')
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';




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
      const result = await query('SELECT * FROM "Artist"');
      res.status(200).send(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send();
    }
});


//Artist details page
app.get('/artist/:artistId', async(req, res) => {
  try {
    const result = await query('SELECT a.*, s."songId", s."songName", s."duration" FROM "Artist" a JOIN "Songs" s ON a."ArtistId" = s."artistId" WHERE a."ArtistId" = $1',[req.params.artistId]);
    console.log(result.rows);
    res.status(200).send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send();
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
  
      query('SELECT s.*, a."ArtistName" FROM "Songs" s JOIN "Artist" a ON s."artistId" = a."ArtistId"').then((result)=>{
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
      const result = await query('SELECT pl."Id" AS "playlistId", pl."Name" AS "playlistName", COUNT(pd."songId") AS trackCount FROM "Playlist" pl JOIN "PlaylistDetails" pd ON pl."Id" = pd."playlistId" GROUP BY pl."Id", pl."Name"');
      res.status(200).send(result.rows);
    } catch(err) {
      console.error(err);
      res.status(500).send();
    }
  }

  else {
    try {
      const decoded:any = jwt.verify(token, JWT_SECRET);
      const result = await query('SELECT pl."Id" AS "playlistId", pl."Name" AS "playlistName", COUNT(pd."songId") AS trackCount FROM "Playlist" pl JOIN "PlaylistDetails" pd ON pl."Id" = pd."playlistId" WHERE pl."CreatorId" = $1 GROUP BY pl."Id", pl."Name"',[decoded.userId]);
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
  const songId = req.params.songId;
  const file = bucket.file(`${songId}.mp3`);
  try {
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    });
    res.json({ url });
  } catch (error:any) {
    res.status(500).send(error.message);
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//Upload folder to firebase
app.post('/upload/', upload.single('song'), (req: any, res: any) => {

  const song = req.file;
  const songName = req.body.songName;
  const duration = req.body.duration;
  
  res.status(200).send({songname:"hi"});
});


//Get playlist details
app.get('/playlists/:playlistId', async(req,res)=>{
  try {
    const result = await query('SELECT s.*, a."ArtistName", p."Id" AS "PlaylistId", p."Name" AS "PlaylistName", u."UserName" FROM public."Songs" AS s JOIN public."Artist" AS a ON s."artistId" = a."ArtistId" JOIN public."PlaylistDetails" AS pd ON s."songId" = pd."songId" JOIN public."Playlist" AS p ON pd."playlistId" = p."Id" JOIN public."UserList" AS u ON p."CreatorId" = u."UserId" WHERE p."Id" = $1 ORDER BY pd."id" DESC',[req.params.playlistId]);
    res.status(200).send(result.rows);
  } catch(err) {
    console.error(err);
    res.status(500).send();
  }
})


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