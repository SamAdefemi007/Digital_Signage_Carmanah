/* global document */
/* global fetch */
/* global setTimeout */
/* global setInterval */
/* global console */
/* eslint quotes: ["error", "double"] */

const CHALLENGE_URL = "https://challenge.carmanahsigns.com/";
const leftOverlay = document.querySelector(".left-aside .video-overlay");
const rightOverlay = document.querySelector(".right-aside .video-overlay");
const tileContainer = document.querySelector(".tile-container");
const tiles = document.querySelectorAll(".tile .value");
const videos = document.querySelectorAll(".video");
const takeover = document.getElementById("takeover");

//This function makes an api call to fetch the data
const fetchUrl = async () => {
  try {
    //The updateNulltiles helps add ellipses to the tiles while the data is fetching
    updateNullTiles();
    const response = await fetch(CHALLENGE_URL);

    if (response.ok) {
      const data = await response.json();
      updateTileOverlay(data);
    } else {
      throw new Error("Error fetching the URL");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    updateTileOverlay(null);
  }
};

//This function updates the tiles and overlays with the values fetched

const updateTileOverlay = (data) => {
  const values = {
    lmax: data?.lmax?.jackpot,
    l649: data?.l649?.jackpot,
    dg: data?.dg?.jackpot,
    scratch: data?.scratch?.jackpot,
  };

  for (const [index, key] of Object.entries(Object.keys(values))) {
    const value = values[key];

    if (value) {
      //removing the commas in the values and parsing the strings to integers
      const parsedValue = parseInt(value.replace(/,/g, ""), 10);

      if (!isNaN(parsedValue) && parsedValue !== 0) {
        const formattedValue = formatTileValue(parsedValue);
        tiles[index].innerHTML = formattedValue;

        if (index < 2) {
          (index === 0 ? leftOverlay : rightOverlay).innerHTML = formattedValue;
        }
      } else {
        updateNullTiles(tiles[index]);
      }
    } else {
      updateNullTiles(tiles[index]);
    }
  }
};

const updateNullTiles = (tile) => {
  if (tile) {
    tile.innerHTML = `
      <span class="circle"></span>
      <span class="circle"></span>
      <span class="circle"></span>
    `;
  } else {
    tiles.forEach((tile) => updateNullTiles(tile));
  }
};

//This function formats the value as indicated in the rules

const formatTileValue = (value) => {
  if (value < 1000000) {
    return `<span class="amount"><span class="dollar">$</span>${value.toLocaleString(
      "en-US"
    )}</span>`;
  } else if (value < 1000000000) {
    const millionValue = Math.floor(value / 1000000);
    return `<span class="amount"><span class="dollar">$</span>${millionValue} <span class="unit">MILLION</span>`;
  } else {
    const billionValue = Math.floor(value / 100000000) / 10;
    return `<span class="amount"><span class="dollar">$</span>${billionValue} <span class="unit">BILLION</span>`;
  }
};

const startTakeOver = () => {
  tileContainer.classList.add("slide-out");
  setTimeout(() => {
    tileContainer.style.display = "none";
    tileContainer.classList.remove("slide-out");
    takeover.style.display = "block";
    takeover.classList.add("slide-in");
    takeover.play();
    toggleVideosPlayback(true);
    showOverlays(false);
  }, 1000);
};

takeover.addEventListener("ended", () => {
  takeover.classList.add("slide-out");
  setTimeout(() => {
    takeover.style.display = "none";
    takeover.classList.remove("slide-out");
    takeover.currentTime = 0;
    tileContainer.style.display = "flex";
    tileContainer.classList.add("slide-in");
    setTimeout(() => {
      tileContainer.classList.remove("slide-in");
    }, 1000);
    toggleVideosPlayback(false);
    showOverlays(true);
  }, 1000);
});

const showOverlays = (isVisible) => {
  leftOverlay.style.display = isVisible ? "flex" : "none";
  rightOverlay.style.display = isVisible ? "flex" : "none";
};

videos.forEach((video) => {
  video.addEventListener("timeupdate", () => {
    if (video.currentTime >= 2) {
      showOverlays(true);
    }
  });
});

const toggleVideosPlayback = (pause) => {
  videos.forEach((video) => {
    if (pause) {
      video.pause();
    } else {
      video.play();
    }
  });
};

fetchUrl();
setInterval(fetchUrl, 60000);
setInterval(startTakeOver, 30000);
