/* eslint-disable react-refresh/only-export-components */
import { createRoot } from "react-dom/client";
import { useState, ChangeEvent } from "react";
import axios from "axios";
import Modal from "react-modal";
import "./index.css";

import { FaCloudDownloadAlt } from "react-icons/fa";
import { BiCoffeeTogo } from "react-icons/bi";

interface SpotifyModalData {
  title: string;
  author: string;
  cover: string;
  youtubeUrl: string;
}

function App(): JSX.Element {
  const [inputValue, setInputValue] = useState<string>("");
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [spotifyModalData, setSpotifyModalData] =
    useState<SpotifyModalData | null>(null);

  const openModal = (): void => {
    setModalIsOpen(true);
  };

  const closeModal = (): void => {
    setModalIsOpen(false);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value);
  };

  const handleDownloadClick = async (): Promise<void> => {
    try {
      if (inputValue.includes("spotify")) {
        const response = await axios.post(
          "http://localhost:3000/api/download",
          {
            url: inputValue,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const { title, author, cover, youtubeUrl } = response.data;

        // Set the Spotify modal data
        setSpotifyModalData({ title, author, cover, youtubeUrl });

        // Open the modal
        openModal();
      } else {
        // Handle non-Spotify URLs here using the co.wuk.sh code
        const response = await axios.post(
          "https://co.wuk.sh/api/json/",
          {
            url: inputValue,
            aFormat: "mp3",
            isAudioOnly: true,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const audioUrl = response.data.url;

        if (audioUrl) {
          const iframe = document.createElement("iframe");
          iframe.style.display = "none";
          iframe.src = audioUrl;

          document.body.appendChild(iframe);

          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        } else {
          console.error("No audio URL available.");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClick = async () => {
    try {
      const response = await axios.post(
        "https://co.wuk.sh/api/json/",
        {
          url: spotifyModalData!.youtubeUrl,
          aFormat: "mp3",
          isAudioOnly: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const audioUrl = response.data.url;

      if (audioUrl) {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = audioUrl;

        document.body.appendChild(iframe);

        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } else {
        console.error("No audio URL available.");
      }
    } catch (error) {
      console.error("Error downloading audio:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950">
      <div className="max-w-md w-full p-6 bg-opacity-80 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-white mb-5">
          MP3 Downloader
        </h1>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter URL"
          className="w-full border border-gray-300 rounded p-2 mb-5 bg-gray-800 text-white"
        />
        <button
          onClick={handleDownloadClick}
          className="w-full bg-green-500 text-white rounded p-3 hover:bg-green-600 transition duration-300 flex items-center justify-center"
        >
          <FaCloudDownloadAlt className="mr-2" />
          Download MP3
        </button>
        <button
          onClick={() =>
            window.open("https://www.buymeacoffee.com/prestonarnold", "_blank")
          }
          className="w-full mt-4 bg-red-500 text-white rounded p-3 hover:bg-red-600 transition duration-300 flex items-center justify-center"
        >
          <BiCoffeeTogo className="mr-2" />
          Buy Me A Coffee
        </button>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          className="modal"
          overlayClassName="overlay"
        >
          {spotifyModalData ? (
            <div className="modal-content bg-gray-900 text-white w-96 mx-auto rounded-lg shadow-lg p-6">
              <img
                src={spotifyModalData.cover}
                alt="Album Cover"
                className="w-64 h-64 mx-auto rounded-lg mb-4"
              />
              <h2 className="text-3xl font-semibold text-center mb-2">
                {spotifyModalData.title}
              </h2>
              <p className="text-gray-400 text-center mb-4">
                {spotifyModalData.author}
              </p>
              <div className="text-center mb-6">
                <a
                  onClick={handleClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 text-lg flex items-center justify-center"
                >
                  <FaCloudDownloadAlt className="h-6 w-6 mr-2" />
                  Download
                </a>
              </div>
            </div>
          ) : (
            <div className="modal-content bg-gray-900 text-white w-96 mx-auto rounded-lg shadow-lg p-6">
              <p className="text-center text-gray-400">Loading...</p>
              <button
                onClick={closeModal}
                className="modal-close mx-auto block bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-6"
              >
                Close
              </button>
            </div>
          )}
        </Modal>
      </div>
      <p className="text-gray-400 mt-4">Made with ❤ by Preston Arnold</p>
    </div>
  );
}

const rootElement = document.getElementById("root") as HTMLElement;
createRoot(rootElement).render(<App />);
