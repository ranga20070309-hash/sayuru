// Force scroll to top on refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", () => {
    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDjzw6S6TmiFBBN-vn3hhM15wW00RXvsJM",
        authDomain: "sayuru-admin-panel.firebaseapp.com",
        databaseURL: "https://sayuru-admin-panel-default-rtdb.asia-southeast1.firebasedatabase.app/",
        projectId: "sayuru-admin-panel",
        storageBucket: "sayuru-admin-panel.firebasestorage.app",
        messagingSenderId: "458294443520",
        appId: "1:458294443520:web:bd8439a8a78811a4f9e2e5"
    };

    // Global site settings override from cloud
    const initializeCloudSync = () => {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            const database = firebase.database();
            const settingsRef = database.ref('site_settings');

            settingsRef.on('value', (snapshot) => {
                const cloudData = snapshot.val();
                if (cloudData) {
                    console.log("OBSCURA OWNER: Updating site from cloud...");
                    // Merge cloud data into local CONFIG
                    Object.assign(window.CONFIG, cloudData);
                    // Re-render UI with new data
                    renderSiteData();
                }
            });
        }
    };

    // Check for local admin preview override
    const localOverride = localStorage.getItem('OBSCURA_CONFIG_OVERRIDE');
    if (localOverride) {
        try {
            const parsed = JSON.parse(localOverride);
            Object.assign(window.CONFIG, parsed);
        } catch (e) {
            console.error("Local override failed:", e);
        }
    }

    // Function to only update text/images/colors from CONFIG
    function renderSiteData() {
        const pageTitle = document.getElementById("page-title");
        const profileName = document.getElementById("profile-name");
        const profileTitle = document.getElementById("profile-title");
        const profileLocation = document.getElementById("profile-location");
        const bgVideo = document.getElementById("bg-video");
        const bgImg = document.getElementById("background-img");
        const songTitleText = document.getElementById("song-title-text");
        const playerAlbumArt = document.getElementById("player-album-art");
        const linkSpotify = document.getElementById("link-spotify");
        const linkTiktok = document.getElementById("link-tiktok");
        const linkApple = document.getElementById("link-apple");
        const audioSource = document.getElementById("audio-source");
        const audio = document.getElementById("bg-music");

        // General Info (Title is handled by typing animation)
        if (profileName) {
            profileName.textContent = CONFIG.name;
            profileName.setAttribute("data-text", CONFIG.name);
        }
        if (profileTitle) profileTitle.textContent = CONFIG.title;
        if (profileLocation) {
            const locContainer = profileLocation.closest('.location');
            if (CONFIG.location && CONFIG.location.trim() !== "") {
                profileLocation.textContent = CONFIG.location;
                if (locContainer) locContainer.style.display = "flex";
            } else {
                if (locContainer) locContainer.style.display = "none";
            }
        }

        // Theme / Primary Color
        document.documentElement.style.setProperty("--primary-color", CONFIG.primaryColor);
        document.documentElement.style.setProperty("--primary-glow", CONFIG.primaryColor + "B3");

        // Background media
        const mediaUrl = CONFIG.backgroundMedia;
        const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaUrl || "");
        if (isVideo && bgVideo) {
            if (bgVideo.src !== mediaUrl) {
                bgVideo.src = mediaUrl;
                bgVideo.load();
                bgVideo.play().catch(() => { });
            }
            bgVideo.style.display = "block";
            if (bgImg) bgImg.style.display = "none";
        } else if (bgImg) {
            bgImg.style.display = "block";
            bgImg.style.backgroundImage = `url('${mediaUrl}')`;
            if (bgVideo) bgVideo.style.display = "none";
        }

        // Enter Screen
        if (CONFIG.enterScreen) {
            const enterVid = document.querySelector(".enter-video");
            if (enterVid && enterVid.src !== CONFIG.enterScreen.videoUrl) enterVid.src = CONFIG.enterScreen.videoUrl;

            const enterTitle = document.querySelector(".enter-title");
            if (enterTitle) {
                enterTitle.textContent = CONFIG.enterScreen.title;
                enterTitle.setAttribute("data-text", CONFIG.enterScreen.title);
            }

            const enterBtn = document.querySelector(".enter-btn");
            if (enterBtn) {
                enterBtn.textContent = CONFIG.enterScreen.buttonText;
                enterBtn.setAttribute("data-text", CONFIG.enterScreen.buttonText);
            }
        }

        // Music
        if (songTitleText) songTitleText.textContent = CONFIG.songTitle;
        if (playerAlbumArt) playerAlbumArt.src = CONFIG.albumArt;
        if (audioSource && audioSource.src !== CONFIG.audioSrc) {
            audioSource.src = CONFIG.audioSrc;
            if (audio) {
                audio.load();
                // We don't play here to wait for Enter button interaction
            }
        }

        // Socials
        if (linkSpotify && CONFIG.socials) linkSpotify.href = CONFIG.socials.spotify;
        if (linkTiktok && CONFIG.socials) linkTiktok.href = CONFIG.socials.tiktok;
        if (linkApple && CONFIG.socials) linkApple.href = CONFIG.socials.apple;

        // Discord / Obscura Info Branding
        if (CONFIG.obscuraInfo) {
            const obsTitle = document.querySelector(".obscura-title");
            if (obsTitle) obsTitle.textContent = CONFIG.obscuraInfo.mainTitle;

            const obsDesc = document.querySelector(".obscura-description");
            if (obsDesc) obsDesc.innerHTML = CONFIG.obscuraInfo.description;

            const obsInvite = document.querySelector(".obscura-invite-btn");
            if (obsInvite) obsInvite.href = CONFIG.obscuraInfo.inviteUrl;

            const fTitle = document.querySelector(".footer-title");
            if (fTitle) fTitle.textContent = CONFIG.obscuraInfo.footerTitle;

            const fDesc = document.querySelector(".footer-desc");
            if (fDesc) fDesc.textContent = CONFIG.obscuraInfo.footerDesc;

            const copyright = document.querySelector(".tape-copyright p");
            if (copyright) copyright.textContent = CONFIG.obscuraInfo.copyrightText;
        }
    }

    // Function to setup one-time Event Listeners
    function setupEventListeners() {
        const enterScreen = document.getElementById("enter-screen"),
            enterBtn = document.querySelector(".enter-btn"),
            mainContent = document.getElementById("main-content"),
            audio = document.getElementById("bg-music"),
            playPauseBtn = document.getElementById("play-pause-btn");

        let isPlaying = false;

        if (enterBtn) {
            enterBtn.addEventListener("click", () => {
                // Audio Context permission
                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission().then(state => {
                        if (state === 'granted') window.addEventListener('deviceorientation', handleOrientation);
                    });
                } else {
                    window.addEventListener('deviceorientation', handleOrientation);
                }

                // Initial Play
                audio.volume = 0.5;
                audio.play().then(() => {
                    isPlaying = true;
                    if (playPauseBtn) playPauseBtn.className = "fa-solid fa-pause";
                }).catch(e => console.log("Audio play failed:", e));

                // BG Video
                const bgVideo = document.getElementById("bg-video");
                if (bgVideo) bgVideo.play().catch(() => { });

                // Entrance
                enterScreen.classList.add("enter-leaving");
                setTimeout(() => {
                    enterScreen.style.display = "none";
                    document.body.classList.add("scroll-enabled");
                    mainContent.classList.remove("hidden");

                    // Show blocks with staggered animation
                    const blocks = [
                        document.querySelector(".container"),
                        document.getElementById("view-counter-box"),
                        document.getElementById("apple-wrapper"),
                        document.getElementById("spotify-wrapper"),
                        document.getElementById("obscura-section")
                    ];
                    blocks.forEach((b, i) => {
                        if (b) {
                            b.style.opacity = "0";
                            b.style.animation = `mainEntrance 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) ${0.2 + (i * 0.15)}s forwards`;
                        }
                    });
                }, 1100);
            });
        }

        // Audio controls listeners (Once)
        const audioToggle = document.getElementById("audio-toggle"),
            volumeSlider = document.getElementById("volume-slider"),
            pbBg = document.getElementById("progress-bar-bg"),
            pbFill = document.getElementById("progress-bar-fill"),
            curT = document.getElementById("current-time"),
            totT = document.getElementById("total-time");

        if (audioToggle) audioToggle.onclick = () => {
            audio.muted = !audio.muted;
            audioToggle.innerHTML = audio.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
        };

        if (volumeSlider) volumeSlider.oninput = (e) => {
            audio.volume = e.target.value / 100;
            audio.muted = (audio.volume === 0);
        };

        if (audio) {
            audio.onloadedmetadata = () => { if (totT) totT.textContent = formatTime(audio.duration); };
            audio.ontimeupdate = () => {
                if (audio.duration && pbFill && curT) {
                    pbFill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
                    curT.textContent = formatTime(audio.currentTime);
                }
            };
        }

        if (pbBg) pbBg.onclick = (e) => {
            if (audio.duration) audio.currentTime = (e.offsetX / pbBg.clientWidth) * audio.duration;
        };

        if (playPauseBtn) playPauseBtn.onclick = () => {
            if (isPlaying) {
                audio.pause();
                playPauseBtn.className = "fa-solid fa-play";
            } else {
                audio.play();
                playPauseBtn.className = "fa-solid fa-pause";
            }
            isPlaying = !isPlaying;
        };
    }

    // Helper functions
    function formatTime(s) {
        if (isNaN(s)) return "0:00";
        let m = Math.floor(s / 60);
        let sc = Math.floor(s % 60);
        return `${m}:${sc < 10 ? "0" : ""}${sc}`;
    }

    function handleOrientation(e) {
        const x = e.gamma; // -90 to 90
        const y = e.beta;  // -180 to 180
        document.documentElement.style.setProperty('--mx', (x * 0.5) + "px");
        document.documentElement.style.setProperty('--my', (y * 0.5) + "px");
    }

    // Lanyard Discord Integration (Websocket for Live updates)
    let lanyardWS = null;
    const updateDiscordUI = (user) => {
        if (!user) return;
        const dAvatar = document.getElementById("d-avatar");
        const dUsername = document.getElementById("d-username");
        const dStatus = document.getElementById("d-status-indicator");
        const dStatusText = document.getElementById("d-status-text");

        if (dAvatar) dAvatar.src = user.discord_user.avatar ? `https://cdn.discordapp.com/avatars/${user.discord_user.id}/${user.discord_user.avatar}.webp?size=256` : window.CONFIG.fallbackDiscordAvatarUrl;
        if (dUsername) dUsername.textContent = user.discord_user.global_name || user.discord_user.username || window.CONFIG.fallbackDiscordUsername;

        const colors = { online: "#43b581", idle: "#faa61a", dnd: "#f04747", offline: "#747f8d" };
        if (dStatus) dStatus.style.background = colors[user.discord_status] || colors.offline;

        if (dStatusText) {
            const activities = user.activities || [];
            const custom = activities.find(a => a.type === 4);
            const game = activities.find(a => a.type === 0);

            if (custom && (custom.state || custom.emoji)) {
                let statusHtml = '';
                if (custom.emoji) {
                    if (custom.emoji.id) {
                        const ext = custom.emoji.animated ? 'gif' : 'webp';
                        statusHtml += `<img src="https://cdn.discordapp.com/emojis/${custom.emoji.id}.${ext}?size=44&quality=lossless" style="height:1.2em; vertical-align:middle; margin-right:4px;"> `;
                    } else {
                        statusHtml += custom.emoji.name + " ";
                    }
                }
                statusHtml += custom.state || '';
                dStatusText.innerHTML = statusHtml;
            } else if (game) {
                dStatusText.textContent = `Playing ${game.name}`;
            } else {
                dStatusText.textContent = user.discord_status.toUpperCase();
            }
        }
    };

    const fetchDiscord = () => {
        const lanyardId = window.CONFIG?.discordUserId;
        if (!lanyardId) return;

        // One-time fetch for current state and cache
        fetch(`https://api.lanyard.rest/v1/users/${lanyardId}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    updateDiscordUI(data.data);
                    localStorage.setItem('OBSCURA_DISCORD_CACHE', JSON.stringify(data.data));
                }
            }).catch(() => {});

        // Setup WebSocket for REAL-TIME updates
        if (lanyardWS) lanyardWS.close();
        lanyardWS = new WebSocket("wss://api.lanyard.rest/socket");

        lanyardWS.onopen = () => {
            lanyardWS.send(JSON.stringify({ op: 2, d: { subscribe_to_id: lanyardId } }));
        };

        lanyardWS.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            if (data.t === "INIT_STATE" || data.t === "PRESENCE_UPDATE") {
                updateDiscordUI(data.d);
                localStorage.setItem('OBSCURA_DISCORD_CACHE', JSON.stringify(data.d));
            }
        };

        lanyardWS.onclose = () => {
            setTimeout(fetchDiscord, 5000); // Auto-reconnect
        };
    };

    // Load from cache instantly
    const cached = localStorage.getItem('OBSCURA_DISCORD_CACHE');
    if (cached) { try { updateDiscordUI(JSON.parse(cached)); } catch(e){} }

    // Observers / Scroll Anims
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add("in-view");
        });
    }, { threshold: 0.1 });
    document.querySelectorAll(".scroll-animate, .premium-spotify-box, .premium-apple-box, .discord-profile-card").forEach(el => scrollObserver.observe(el));

    // Live Time
    setInterval(() => {
        const timeBox = document.getElementById("local-time");
        if (timeBox) timeBox.textContent = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    }, 1000);

    // Tab Title Typing Effect
    let titleIndex = 0;
    let titleDirection = 1;
    const updateTitleType = () => {
        const fullTitle = window.CONFIG?.tabName || "@SVYUXU";
        const currentText = fullTitle.substring(0, titleIndex);
        document.title = currentText + "|";

        if (titleDirection === 1) {
            if (titleIndex < fullTitle.length) {
                titleIndex++;
                setTimeout(updateTitleType, 200);
            } else {
                titleDirection = -1;
                setTimeout(updateTitleType, 2000); // Wait at end
            }
        } else {
            if (titleIndex > 1) {
                titleIndex--;
                setTimeout(updateTitleType, 100);
            } else {
                titleDirection = 1;
                setTimeout(updateTitleType, 500); // Wait at start
            }
        }
    };
    updateTitleType();

    // Initial Execution
    fetchDiscord();           // Load Discord info FIRST
    renderSiteData();        // Render from local CONFIG immediately
    setupEventListeners();    // Connect buttons once
    initializeCloudSync();   // Setup real-time firebase updates

    // Custom Cursor & Ranga's Ripple Tail
    const cursor = document.getElementById("cursor");
    const canvas = document.getElementById("water-tail");
    const ctx = canvas ? canvas.getContext("2d") : null;

    if (cursor) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;
        let ripples = [];
        let lastRippleTime = 0;

        if (canvas) {
            const resize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            };
            window.addEventListener("resize", resize);
            resize();
        }

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.opacity = "1";

            if (canvas) {
                let now = Date.now();
                if (now - lastRippleTime > 300) {
                    ripples.push({
                        x: mouseX,
                        y: mouseY,
                        radius: 0,
                        maxRadius: Math.random() * 20 + 50,
                        speed: Math.random() * 0.2 + 0.3,
                        life: 1,
                        thickness: 2
                    });
                    lastRippleTime = now;
                }
            }
        });

        document.querySelectorAll("a, button, .nav-item, .tape-link, .enter-btn, .audio-control, .social-icon").forEach(el => {
            el.addEventListener("mouseenter", () => cursor.classList.add("cursor-hover"));
            el.addEventListener("mouseleave", () => cursor.classList.remove("cursor-hover"));
        });

        function animateCursorSystem() {
            // Smooth lerp - exactly like Ranga
            cursorX += (mouseX - cursorX) * 0.35;
            cursorY += (mouseY - cursorY) * 0.35;

            cursor.style.left = cursorX + "px";
            cursor.style.top = cursorY + "px";

            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (let i = ripples.length - 1; i >= 0; i--) {
                    let r = ripples[i];
                    r.radius += r.speed; // Normal speed (slower)
                    let progress = r.radius / r.maxRadius;
                    r.life = 1 - Math.pow(progress, 1.5);

                    if (r.life <= 0) {
                        ripples.splice(i, 1);
                        continue;
                    }

                    ctx.beginPath();
                    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                    ctx.lineWidth = r.thickness;
                    ctx.strokeStyle = `rgba(255, 0, 0, ${r.life})`;
                    ctx.shadowColor = `rgba(255, 0, 0, ${r.life * 0.8})`;
                    ctx.shadowBlur = 5;
                    ctx.stroke();
                }
            }
            requestAnimationFrame(animateCursorSystem);
        }
        animateCursorSystem();
    }

    // Smooth Scroll (Lenis)
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis();
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }
});
