const { GetListByKeyword } = require("youtube-search-api");
const axios = require("axios");

function validateUrl(url) {
  return (
    url.startsWith("https://open.spotify.com/track/") ||
    url.startsWith("https://spotify.link/")
  );
}

async function getTitleAndAuthor(url) {
  if (!validateUrl(url)) {
    return "Incorrect URL";
  }

  const uri = new URL(url);
  uri.search = ""; // Deleting any tracking params

  try {
    const response = await axios.get(uri.toString());

    if (response.status !== 200) {
      throw new Error("Request failed");
    }

    const text = response.data;

    const titleMatch = text.match(/(?<=:title" content=")(.*?)(?=")/gm);
    const authorMatch = text.match(
      /(?<=:description" content=")(.*?)(?= · )/gm
    );
    const coverMatch = text.match(/(?<=:image" content=")(.*?)(?=")/gm);

    if (!titleMatch || !authorMatch || !coverMatch) {
      return "Invalid URL";
    }

    const title = titleMatch[0];
    const author = authorMatch[0];
    const cover = coverMatch[0];

    return { title, author, cover };
  } catch (error) {
    return "Error fetching URL";
  }
}

async function searchYouTube(query) {
  try {
    const searchResult = await GetListByKeyword(query);
    return searchResult;
  } catch (error) {
    throw new Error("YouTube search failed");
  }
}

async function download(req, res) {
  const { url } = req.body;

  const info = await getTitleAndAuthor(url);

  if (typeof info === "string") {
    res.status(400).json({ error: info });
    return;
  }

  const query = `${info.title} - ${info.author}`;

  try {
    const youtubeResults = await searchYouTube(query);

    if (youtubeResults.items && youtubeResults.items.length > 0) {
      const firstResult = youtubeResults.items[0];
      const videoId = firstResult.id; // Extract the video ID
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`; // Construct the YouTube URL

      // Directly send the response with the YouTube URL
      res.json({
        title: info.title,
        author: info.author,
        cover: info.cover,
        youtubeUrl: youtubeUrl,
      });
    } else {
      res.status(404).json({ error: "No YouTube results found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = download;
