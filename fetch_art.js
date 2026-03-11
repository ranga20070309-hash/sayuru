const urls = [
  "https://open.spotify.com/album/5UjUGkRTqodtoni6VLQJ4t?si=grcYAzAgRLWYl-ZOS0tmfQ",
  "https://open.spotify.com/album/68lxvBtYV8WAYRVQqWQb1K?si=iL7qvzzDSKC1ccYVG_7bYg",
  "https://open.spotify.com/album/0rrReZ1ZOQzKHoymhzw0ZW?si=VY7U9wumQumCTf4zxL0p7A",
  "https://open.spotify.com/album/6MktDdi4f9BGbHbX8tiPYO?si=OjRctk8gRMS4X403gVa86g",
  "https://open.spotify.com/album/7wZlx1gIo8MI53tusokhpj?si=PVLyJhOYQ0uJmWBKxtfDNQ",
  "https://open.spotify.com/album/3W5CFVedLjSFVbTubHnX9P?si=tqujsxUUSyOUW0KZnAWUmg",
  "https://open.spotify.com/album/6hDzhelEz77j5B65l6Pwfv?si=gSsgh3fNTU6tUYW2JPDxfQ",
  "https://open.spotify.com/album/13fRxuorQl3YXdpAwk3A68?si=impT_mxrTlWHvfAvBtS4nQ",
  "https://open.spotify.com/album/2vkNxS3Vx4Z5rpNZihmx58?si=8G-BU_HPRjuS9vNrZQ9f-A",
  "https://open.spotify.com/album/1OTVqW97vPGx09kjeBw9Ob?si=2z2tQFymTHuSK1-TDERlWQ"
];

async function fetchArts() {
  const arts = [];
  for (let url of urls) {
    const cleanUrl = url.split("?")[0];
    const oembed = `https://open.spotify.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
    try {
      const resp = await fetch(oembed);
      const data = await resp.json();
      arts.push(data.thumbnail_url);
    } catch (e) {
      arts.push("error");
    }
  }
  console.log(JSON.stringify(arts, null, 2));
}

fetchArts();
