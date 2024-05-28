"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
var bodyParser = require('body-parser');
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const app = (0, express_1.default)();
const serviceAccount = require('../../../Users/Divum/Documents/serviceAccountKey.json');
app.use((0, cors_1.default)());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
dotenv_1.default.config();
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
    storageBucket: 'vibify-b0716.appspot.com'
});
const bucket = firebase_admin_1.default.storage().bucket();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}
//Get artists in home page
app.get('/home-artists', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)('SELECT * FROM "Artist"');
        res.status(200).send(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send();
    }
}));
//Artist details page
app.get('/artist/:artistId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)('SELECT a.*, s."songId", s."songName", s."duration" FROM "Artist" a JOIN "Songs" s ON a."ArtistId" = s."artistId" WHERE a."ArtistId" = $1', [req.params.artistId]);
        console.log(result.rows);
        res.status(200).send(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send();
    }
}));
//Get songs in home page
app.get('/home-songs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        try {
            (0, db_1.default)('SELECT s.*, a."ArtistName" FROM "Songs" s JOIN "Artist" a ON s."artistId" = a."ArtistId"').then((result) => {
                res.status(200).send(result.rows);
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).send();
        }
    }
    else {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            (0, db_1.default)('SELECT s.*, a."ArtistName" FROM "Songs" s JOIN "Artist" a ON s."artistId" = a."ArtistId"').then((result) => {
                res.status(200).send(result.rows);
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).send();
        }
    }
}));
//Add songs to playlist
app.post('/saveToPlaylist', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { selectedPlaylists, songId } = req.body;
    if (!selectedPlaylists || selectedPlaylists.length === 0 || !songId) {
        return res.status(400).send({ error: 'Invalid input: selectedPlaylists and songId are required' });
    }
    try {
        const present = yield (0, db_1.default)('SELECT "playlistId" FROM "PlaylistDetails" WHERE "songId" = $1 AND "playlistId" = ANY($2::int[])', [songId, selectedPlaylists]);
        const existingPlaylists = present.rows.map(row => row.playlistId);
        const newPlaylists = selectedPlaylists.filter((playlistId) => !existingPlaylists.includes(playlistId));
        if (newPlaylists.length > 0) {
            const insertQuery = 'INSERT INTO "PlaylistDetails" ("playlistId", "songId") VALUES ($1, $2)';
            for (const playlistId of newPlaylists) {
                yield (0, db_1.default)(insertQuery, [playlistId, songId]);
            }
            return res.status(200).send('Added successfully');
        }
        else {
            return res.status(200).send('Already exists in all selected playlists');
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ error: 'An error occurred while saving the song to playlists' });
    }
}));
//Remove song from playlist
app.post('/removeFromPlaylist', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { playlistId, songId } = req.body;
    if (!playlistId || !songId) {
        return res.status(400).send({ error: 'Invalid input: selectedPlaylists and songId are required' });
    }
    try {
        const result = yield (0, db_1.default)('DELETE FROM "PlaylistDetails" WHERE "playlistId" = $1 AND "songId" = $2 RETURNING *', [playlistId, songId]);
        if (result.rowCount && result.rowCount > 0) {
            return res.status(200).send('Song removed from playlist successfully');
        }
        else {
            return res.status(404).send({ error: 'Song not found in the specified playlist' });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ error: 'An error occurred while removing the song from playlists' });
    }
}));
//Get playlists in home page
app.get('/home-playlists', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        try {
            const result = yield (0, db_1.default)('SELECT pl."Id" AS "playlistId", pl."Name" AS "playlistName", COUNT(pd."songId") AS trackCount FROM "Playlist" pl JOIN "PlaylistDetails" pd ON pl."Id" = pd."playlistId" GROUP BY pl."Id", pl."Name"');
            res.status(200).send(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).send();
        }
    }
    else {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const result = yield (0, db_1.default)('SELECT pl."Id" AS "playlistId", pl."Name" AS "playlistName", COUNT(pd."songId") AS trackCount FROM "Playlist" pl JOIN "PlaylistDetails" pd ON pl."Id" = pd."playlistId" WHERE pl."CreatorId" = $1 GROUP BY pl."Id", pl."Name"', [decoded.userId]);
            res.status(200).send(result.rows);
        }
        catch (err) {
            if (err.name === 'TokenExpiredError') {
                res.status(401).send('Token expired');
            }
            console.error(err);
            res.status(500).send();
        }
    }
}));
//get song from firebase
app.get('/song/:songId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const songId = req.params.songId;
    const file = bucket.file(`${songId}.mp3`);
    try {
        const [url] = yield file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
        });
        res.json({ url });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
//Upload folder to firebase
app.post('/upload/:folderName', upload.single('song'), (req, res) => {
    const folderName = req.params.folderName;
    console.log('Folder Name:', folderName);
    // const song = req.file
    console.log('Form Data:', req.body);
    console.log('File Data:', req.file);
    // Send a response with the form data
    res.status(200).send({ songname: "hi" });
});
//Get playlist details
app.get('/playlists/:playlistId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, db_1.default)('SELECT s.*, a."ArtistName", p."Id" AS "PlaylistId", p."Name" AS "PlaylistName", u."UserName" FROM public."Songs" AS s JOIN public."Artist" AS a ON s."artistId" = a."ArtistId" JOIN public."PlaylistDetails" AS pd ON s."songId" = pd."songId" JOIN public."Playlist" AS p ON pd."playlistId" = p."Id" JOIN public."UserList" AS u ON p."CreatorId" = u."UserId" WHERE p."Id" = $1 ORDER BY pd."id" DESC', [req.params.playlistId]);
        res.status(200).send(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send();
    }
}));
//Login api
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { loginCredential, password } = req.body;
        const user = yield (0, db_1.default)('SELECT * FROM "UserList" WHERE "email"=$1 OR "UserList"."UserName"=$1', [loginCredential]);
        if (user.rows.length > 0) {
            const userData = user.rows[0];
            const validPassword = yield bcrypt_1.default.compare(password, userData.password);
            if (validPassword) {
                const token = jsonwebtoken_1.default.sign({ userId: userData.UserId }, JWT_SECRET, {
                    expiresIn: '10h'
                });
                res.status(200).send({ token });
            }
            else {
                res.status(401).send('Password not match');
            }
        }
        else {
            res.status(404).send('User not found');
        }
    }
    catch (err) {
        res.status(500).send('Internal Server Error');
    }
}));
//signup api
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        const user = yield (0, db_1.default)('SELECT * FROM "UserList" WHERE "email"=$1', [email]);
        const userWithName = yield (0, db_1.default)('SELECT * FROM "UserList" WHERE "UserName"=$1', [username]);
        if (user.rows.length > 0) {
            res.status(409).send('Email already exist');
        }
        else {
            if (userWithName.rows.length > 0) {
                res.status(409).send('Username already exist');
            }
            else {
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashedPassword = yield bcrypt_1.default.hash(password, salt);
                const resp = yield (0, db_1.default)(`INSERT INTO "UserList" ("UserName", "email", "password") VALUES ($1, $2, $3);`, [username, email, hashedPassword]);
                res.status(200).send('User saved successfully');
            }
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send();
    }
}));
//Backend server port
app.listen('8080', () => {
    console.log('Server is running on port 8080');
});
