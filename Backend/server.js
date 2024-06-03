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
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const userId = decoded.userId;
            const result = yield (0, db_1.default)('SELECT a.*, s."songId", s."songName", s."duration", s."lyrics", CASE WHEN sl."songid" IS NOT NULL THEN TRUE ELSE FALSE END AS "isLiked" FROM "Artist" a JOIN "Songs" s ON a."ArtistId" = s."artistId" LEFT JOIN "SongLikes" sl ON s."songId" = sl."songid" AND sl."userid" = $1 WHERE a."ArtistId" = $2;', [userId, req.params.artistId]);
            res.status(200).send(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).send();
        }
    }
    else {
        try {
            const result = yield (0, db_1.default)('SELECT a.*, s."songId", s."songName", s."duration", s."lyrics" FROM "Artist" a JOIN "Songs" s ON a."ArtistId" = s."artistId" WHERE a."ArtistId" = $1', [req.params.artistId]);
            res.status(200).send(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).send();
        }
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
            const userId = decoded.userId;
            (0, db_1.default)('SELECT s.*, a."ArtistName", CASE WHEN sl."songid" IS NOT NULL THEN TRUE ELSE FALSE END AS "isLiked" FROM "Songs" s JOIN "Artist" a ON s."artistId" = a."ArtistId" LEFT JOIN "SongLikes" sl ON s."songId" = sl."songid" AND sl."userid" = $1', [userId]).then((result) => {
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
            const result = yield (0, db_1.default)('SELECT pl."Id" AS "playlistId", pl."Name" AS "playlistName", COUNT(pd."songId") AS trackCount FROM "Playlist" pl LEFT JOIN "PlaylistDetails" pd ON pl."Id" = pd."playlistId" GROUP BY pl."Id", pl."Name"');
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
            const result = yield (0, db_1.default)('SELECT pl."Id" AS "playlistId", pl."Name" AS "playlistName", COUNT(pd."songId") AS trackCount FROM "Playlist" pl LEFT JOIN "PlaylistDetails" pd ON pl."Id" = pd."playlistId" WHERE pl."CreatorId" = $1 GROUP BY pl."Id", pl."Name"', [decoded.userId]);
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
    var _a;
    const { songId } = req.params;
    try {
        const bucket = firebase_admin_1.default.storage().bucket();
        const prefix = `${songId}/`;
        const [files] = yield bucket.getFiles({ prefix });
        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'Files not found' });
        }
        let urls = {
            mp3: null,
            cover: null
        };
        for (const file of files) {
            const [url] = yield file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491',
            });
            const extension = (_a = file.name.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            if (extension === 'mp3') {
                urls.mp3 = url;
            }
            else if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'jfif') {
                urls.cover = url;
            }
        }
        res.status(200).send(urls);
    }
    catch (error) {
        console.error('Error fetching file URLs:', error);
        res.status(500).send('Internal server error');
    }
}));
//Get song cover from firebase
app.get('/songCover/:songId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { songId } = req.params;
    try {
        const bucket = firebase_admin_1.default.storage().bucket();
        const prefix = `${songId}/`;
        const [files] = yield bucket.getFiles({ prefix });
        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'Files not found' });
        }
        let coverUrl;
        for (const file of files) {
            const [url] = yield file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491',
            });
            const extension = (_b = file.name.split('.').pop()) === null || _b === void 0 ? void 0 : _b.toLowerCase();
            if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
                coverUrl = url;
            }
        }
        res.status(200).send(coverUrl);
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}));
//Upload folder to firebase
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const multipleUpload = upload.fields([
    { name: 'song', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]);
app.post('/upload', multipleUpload, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const userId = decoded.userId;
            const result = yield (0, db_1.default)('SELECT * FROM "Artist" WHERE "UserId"=$1', [userId]);
            if (result.rowCount && result.rowCount > 0) {
                const song = req.files.song[0];
                const image = req.files.coverImage[0];
                const { songName, duration, lyrics } = req.body;
                const artistId = result.rows[0].ArtistId;
                const upload = yield (0, db_1.default)('INSERT INTO "Songs"("artistId", "songName", "duration", "lyrics") VALUES ($1, $2, $3, $4) RETURNING "songId"', [artistId, songName, duration, lyrics]);
                if (upload.rowCount && upload.rowCount > 0) {
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
                    yield Promise.all(uploads);
                    return res.status(200).send('Files uploaded successfully.');
                }
            }
            else {
                return res.status(403).send('You are not an artist.');
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).send('Error: ', err);
        }
    }
    else {
        res.status(401).send('No token provided.');
    }
}));
//Create playlist
app.post('/create/playlist', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const userId = decoded.userId;
            const { playlistName } = req.body;
            const resp = yield (0, db_1.default)('INSERT INTO "Playlist"("Name", "CreatorId") VALUES ($1, $2) RETURNING "Id"', [playlistName, userId]);
            if (resp.rowCount && resp.rowCount > 0) {
                res.status(200).send('Playlist created successfully');
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }
}));
//Get playlist details
app.get('/playlists/:playlistId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const userId = decoded.userId;
            const result = yield (0, db_1.default)('SELECT p."Id" AS "PlaylistId", p."Name" AS "PlaylistName", p."Likes" AS "PlaylistLikes", s.*, a."ArtistName", u."UserName", CASE WHEN sl."songid" IS NOT NULL THEN TRUE ELSE FALSE END AS "isLiked" FROM public."Playlist" AS p LEFT JOIN public."PlaylistDetails" AS pd ON p."Id" = pd."playlistId" LEFT JOIN public."Songs" AS s ON pd."songId" = s."songId" LEFT JOIN public."Artist" AS a ON s."artistId" = a."ArtistId" LEFT JOIN public."UserList" AS u ON p."CreatorId" = u."UserId" LEFT JOIN public."SongLikes" AS sl ON s."songId" = sl."songid" AND sl."userid" = $1 WHERE p."Id" = $2 ORDER BY pd."id" DESC', [userId, req.params.playlistId]);
            res.status(200).send(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).send();
        }
    }
    else {
        try {
            const result = yield (0, db_1.default)('SELECT p."Id" AS "PlaylistId", p."Name" AS "PlaylistName", p."Likes" AS "PlaylistLikes", s.*, a."ArtistName", u."UserName" FROM public."Playlist" AS p LEFT JOIN public."PlaylistDetails" AS pd ON p."Id" = pd."playlistId" LEFT JOIN public."Songs" AS s ON pd."songId" = s."songId" LEFT JOIN public."Artist" AS a ON s."artistId" = a."ArtistId" LEFT JOIN public."UserList" AS u ON p."CreatorId" = u."UserId" WHERE p."Id" = $1 ORDER BY pd."id" DESC', [req.params.playlistId]);
            res.status(200).send(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).send();
        }
    }
}));
//Get favorite songs
app.get('/favorites', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const userId = decoded.userId;
            const result = yield (0, db_1.default)('SELECT s."songId", s."songName", s."artistId", a."ArtistName", s."duration", s."lyrics" FROM "SongLikes" sl JOIN "Songs" s ON sl."songid" = s."songId" JOIN "Artist" a ON s."artistId" = a."ArtistId" WHERE sl."userid" = $1 ORDER BY sl."id" DESC', [userId]);
            res.status(200).send(result.rows);
        }
        catch (err) {
            console.error(err);
        }
    }
    else {
        res.status(401).send('Token Missing');
    }
}));
//Like song
app.post('/like/:songId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const userId = decoded.userId;
            const resp = yield (0, db_1.default)('INSERT INTO "SongLikes"("userid","songid") VALUES ($1, $2)', [userId, req.params.songId]);
            res.status(200).send('Song liked');
        }
        catch (err) {
            console.error(err);
            res.status(500).send();
        }
    }
    else {
        res.status(401).send('Unauthorized');
    }
}));
//Unlike song
app.delete('/unlike/:songId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const userId = decoded.userId;
            const resp = yield (0, db_1.default)('DELETE FROM "SongLikes" WHERE "userid" = $1 AND "songid" = $2', [userId, req.params.songId]);
            res.status(200).send('Song unliked');
        }
        catch (err) {
            console.error(err);
            res.status(500).send();
        }
    }
    else {
        res.status(401).send('Unauthorized');
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
