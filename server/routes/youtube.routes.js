const axios = require('axios');
const ytKey = process.env.JGYOUTUBEKEY;
const channelId = 'UCreuqJy8PFZ2yMmt_562SaA';
const _flatten = require('lodash/flatten');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
const moment = require('moment');
const fs = require('fs');

function getPlaylists(pageToken) {
  const url = pageToken
    ? `https://www.googleapis.com/youtube/v3/playlists?channelId=${channelId}&part=snippet,contentDetails&key=${ytKey}&maxResults=50&pageToken=${pageToken}`
    : `https://www.googleapis.com/youtube/v3/playlists?channelId=${channelId}&part=snippet,contentDetails&key=${ytKey}&maxResults=50`;
  return axios.get(url);
}

function getVideos(playlistId, pageToken) {
  const url = pageToken
    ? `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet,contentDetails,status&key=${ytKey}&maxResults=50&pageToken=${pageToken}`
    : `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet,contentDetails,status&key=${ytKey}&maxResults=50`;
  return axios.get(url);
}

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
  getPlaylists(req.body.pageToken)
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
    getVideos(req.body.playlistId, req.body.pageToken)
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

module.exports.csvReport = async function (req, res) {
  getPlaylists()
    .then((playlists) => {
      try {
        const lists = playlists.data.items;
        const listJson = async () => {
          return Promise.all(
            lists.map((list) => {
              if (list && list.id) {
                return getVideos(list.id);
              } else {
                return Promise.resolve();
              }
            })
          ).catch((err) => {
            res.status(500).send(err);
          });
        };
        listJson().then((final) => {
          const finalData = final.map((f) => f.data);
          const flat = _flatten(finalData.map((f) => f.items));
          const formatted = flat.map((item) => {
            return {
              title: item.snippet.title,
              description: item.snippet.description,
              published: moment(item.snippet.publishedAt).format('MM/DD/YYYY HH:mm'),
              url: `https://studio.youtube.com/video/${item.contentDetails.videoId}/edit`,
              id: item.snippet.playlistId
            };
          });
          const header = [
            { id: 'title', title: 'Video Title' },
            { id: 'description', title: 'Description' },
            { id: 'published', title: 'Date' },
            { id: 'url', title: 'Link' },
            { id: 'id', title: 'Playlist ID' }
          ];
          const csvStringifier = createCsvStringifier({
            header
          });
          const combined =
            csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(formatted);
          res.status(200).send(combined);
        });
      } catch (err) {
        res.status(500).send(err);
      }
    })
    .catch((error) => {
      res.status(500).send(error);
    });
};
