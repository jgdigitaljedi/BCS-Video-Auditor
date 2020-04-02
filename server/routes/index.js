const express = require('express');
const router = express.Router();
const youtube = require('./youtube.routes');

router.get('/channel', youtube.channel);
router.get('/playlists', youtube.playlist);
router.post('/playlist', youtube.playlistItems);

module.exports = router;
