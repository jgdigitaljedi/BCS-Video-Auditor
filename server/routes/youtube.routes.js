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
