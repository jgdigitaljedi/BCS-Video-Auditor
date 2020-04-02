const axios = require('axios');
const ytKey = process.env.JGYOUTUBEKEY;
const channelId = 'UCreuqJy8PFZ2yMmt_562SaA';

module.exports.channel = function (req, res) {
  axios
    .get(
      `https://www.googleapis.com/youtube/v3/channels/?part=snippet,contentDetails,statistics&id=${channelId}&key=${ytKey}`
    )
    .then((result) => {
      res.status(200).json(result.data);
    })
    .catch((error) => {
      console.log('channel error', error);
      res.status(500).json(error);
    });
};

module.exports.playlist = function (req, res) {
  axios
    .get(
      `https://www.googleapis.com/youtube/v3/playlists?channelId=${channelId}&part=snippet,contentDetails&key=${ytKey}&maxResults=50`
    )
    .then((result) => {
      res.status(200).json(result.data);
    })
    .catch((error) => {
      console.log('playlist error', error);
      res.status(500).send(error);
    });
};

module.exports.playlistItems = function (req, res) {
  if (req && req.body && req.body.playlistId) {
    axios
      .get(
        `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${req.body.playlistId}&part=snippet,contentDetails&key=${ytKey}&maxResults=50`
      )
      .then((result) => {
        res.status(200).json(result.data);
      })
      .catch((error) => {
        console.log('playlist error', error);
        res.status(500).send(error);
      });
  } else {
    res.status(400).json({ error: true, message: 'BAD REQUEST: You must send a playlist ID' });
  }
};
