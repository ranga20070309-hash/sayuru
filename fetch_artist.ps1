$urls = @(
  "https://open.spotify.com/album/5UjUGkRTqodtoni6VLQJ4t",
  "https://open.spotify.com/album/68lxvBtYV8WAYRVQqWQb1K",
  "https://open.spotify.com/album/0rrReZ1ZOQzKHoymhzw0ZW",
  "https://open.spotify.com/album/6MktDdi4f9BGbHbX8tiPYO",
  "https://open.spotify.com/album/7wZlx1gIo8MI53tusokhpj",
  "https://open.spotify.com/album/3W5CFVedLjSFVbTubHnX9P",
  "https://open.spotify.com/album/6hDzhelEz77j5B65l6Pwfv",
  "https://open.spotify.com/album/13fRxuorQl3YXdpAwk3A68",
  "https://open.spotify.com/album/2vkNxS3Vx4Z5rpNZihmx58",
  "https://open.spotify.com/album/1OTVqW97vPGx09kjeBw9Ob"
)

foreach ($u in $urls) {
    try {
        $html = Invoke-RestMethod -Uri $u -ErrorAction Stop
        if ($html -match '<title>(.*?)</title>') {
            $title = $matches[1]
            Write-Output ("Title: " + $title)
        } else {
            Write-Output "Title not found"
        }
    } catch {
        Write-Output "error"
    }
}
