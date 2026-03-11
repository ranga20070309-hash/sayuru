// Force scroll to top on refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lenis for Buttery Smooth Scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Load CONFIG
    document.getElementById("page-title").textContent = CONFIG.name;

    const profileNameEl = document.getElementById("profile-name");
    profileNameEl.innerHTML = CONFIG.name;
    profileNameEl.setAttribute("data-text", CONFIG.name);

    document.getElementById("profile-title").textContent = CONFIG.title;
    document.getElementById("profile-location").textContent = CONFIG.location;

    // Tab Title Animation (Scrolling)
    const titleText = (CONFIG.tabName || "@SVYUXU") + "   \u2022   ";
    let titleIndex = 0;

    setInterval(() => {
        document.title = titleText.substring(titleIndex) + titleText.substring(0, titleIndex);
        titleIndex = (titleIndex + 1) % titleText.length;
    }, 400);

    document.documentElement.style.setProperty("--primary-color", CONFIG.primaryColor);
    document.documentElement.style.setProperty("--primary-glow", CONFIG.primaryColor + "B3");

    // Background media
    const mediaUrl = CONFIG.backgroundMedia;
    const bgVideo = document.getElementById("bg-video");
    const bgImg = document.getElementById("background-img");
    const bgMotionLayer = document.getElementById("bg-motion-layer");

    const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaUrl || "");

    if (isVideo) {
        bgVideo.src = mediaUrl;
        bgVideo.muted = true;
        bgVideo.loop = true;
        bgVideo.setAttribute("playsinline", "");
        bgVideo.setAttribute("webkit-playsinline", "");
        bgVideo.setAttribute("autoplay", "");
        bgVideo.style.display = "block";
        bgImg.style.display = "none";
        bgVideo.load();

        const forcePlay = (vid) => {
            const p = vid.play();
            if (p !== undefined) p.catch(() => {});
        };

        // Aggressive handling for ALL videos to never freeze
        const enforceVideo = (vid) => {
            vid.muted = true;
            vid.loop = true;
            vid.setAttribute("playsinline", "");
            vid.setAttribute("webkit-playsinline", "");
            vid.setAttribute("autoplay", "");
            
            // Native loop fallback
            vid.addEventListener("ended", () => {
                vid.currentTime = 0;
                forcePlay(vid);
            });
            // Prevent auto-pausing by browser
            vid.addEventListener("pause", () => {
                if (vid.currentTime > 0 && !vid.ended) {
                    forcePlay(vid);
                }
            });
            forcePlay(vid);
        };

        enforceVideo(bgVideo);

        const enterVideo = document.querySelector('.enter-video');
        if (enterVideo) {
            enforceVideo(enterVideo);
            // On user click, we also force the 2nd screen background video to play to overcome iOS restrictions
            document.body.addEventListener("click", () => forcePlay(bgVideo), { once: true });
        }

        bgVideo.addEventListener("error", () => {
            console.log("Background video failed to load.");
        });
    } else {
        bgImg.style.display = "block";
        bgImg.style.backgroundImage = `url('${mediaUrl}')`;
        bgVideo.style.display = "none";
    }

    // Fake VR / cinema motion
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    const autoPanStrength = isTouchDevice ? 6 : 10;
    const mouseStrengthX = 50;
    const mouseStrengthY = 25;
    const rotateStrength = 3.5;

    // Wrap the container for middle details parallax without breaking CSS animations
    const containerEl = document.querySelector(".container");
    let parallaxWrapper = null;
    if (containerEl && containerEl.parentNode) {
        parallaxWrapper = document.createElement("div");
        parallaxWrapper.style.width = "100%";
        parallaxWrapper.style.display = "flex";
        parallaxWrapper.style.flexDirection = "column";
        parallaxWrapper.style.alignItems = "center";
        parallaxWrapper.style.perspective = "1200px";
        parallaxWrapper.style.transformStyle = "preserve-3d";
        parallaxWrapper.classList.add("js-parallax-wrapper");
        
        containerEl.parentNode.insertBefore(parallaxWrapper, containerEl);
        parallaxWrapper.appendChild(containerEl);
    }

    document.addEventListener("mousemove", (e) => {
        if (isTouchDevice) return;

        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;

        pointerX = -x * mouseStrengthX;
        pointerY = -y * mouseStrengthY;
    });

    function handleOrientation(event) {
        if (!event.gamma || !event.beta) return;
        
        let x = event.gamma; // -90 to 90
        let y = event.beta;  // -180 to 180
        
        // Clamp ranges to prevent extreme flips
        if (x > 45) x = 45;
        if (x < -45) x = -45;
        
        // Assume holding phone at ~45 degrees is neutral
        y = y - 45; 
        if (y > 45) y = 45;
        if (y < -45) y = -45;
        
        const normX = x / 45; 
        const normY = y / 45; 
        
        // Responsively update the same pointer variables used for background logic
        pointerX = -normX * mouseStrengthX * 0.8;
        pointerY = -normY * mouseStrengthY * 0.8;
    }

    function animateBackground(time) {
        const t = time * 0.00022;

        const autoPanX = Math.sin(t) * autoPanStrength;
        const autoPanY = Math.sin(t * 0.45) * 1.8;

        currentX += ((autoPanX + pointerX) - currentX) * 0.04;
        currentY += ((autoPanY + pointerY) - currentY) * 0.05;

        const targetRotY = (currentX / 28) * rotateStrength;
        const targetRotX = (-currentY / 22) * rotateStrength;

        currentRotY += (targetRotY - currentRotY) * 0.04;
        currentRotX += (targetRotX - currentRotX) * 0.04;

        // Apply CSS variables for generic elements
        document.documentElement.style.setProperty('--mx', currentX);
        document.documentElement.style.setProperty('--my', currentY);
        document.documentElement.style.setProperty('--rx', currentRotX);
        document.documentElement.style.setProperty('--ry', currentRotY);

        requestAnimationFrame(animateBackground);
    }

    requestAnimationFrame(animateBackground);

    // Discord fallback
    const fallbackAvatar = CONFIG.fallbackDiscordAvatarUrl;
    document.getElementById("d-avatar").src = fallbackAvatar;
    document.getElementById("d-username").textContent = CONFIG.fallbackDiscordUsername;
    document.getElementById("d-status-indicator").style.backgroundColor = "#747f8d";
    document.getElementById("d-status-text").textContent = "Connecting to Discord...";

    // Lanyard
    const discordId = CONFIG.discordUserId;
    if (discordId !== "") {
        function connectLanyard() {
            const ws = new WebSocket("wss://api.lanyard.rest/socket");

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);

                if (message.op === 1) {
                    ws.send(JSON.stringify({
                        op: 2,
                        d: { subscribe_to_id: discordId }
                    }));
                } else if (message.op === 0) {
                    if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
                        const data = message.d;
                        const user = data.discord_user;

                        if (user.avatar) {
                            const ext = user.avatar.startsWith("a_") ? "gif" : "png";
                            document.getElementById("d-avatar").src =
                                `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
                        } else {
                            document.getElementById("d-avatar").src = fallbackAvatar;
                        }

                        document.getElementById("d-username").textContent = user.global_name || user.username || CONFIG.fallbackDiscordUsername;

                        // Clear out the hardcoded badges since this is now dynamically another profile.
                        document.getElementById("d-badges").innerHTML = "";

                        const statusColors = {
                            online: "#43b581",
                            idle: "#faa61a",
                            dnd: "#f04747",
                            offline: "#747f8d"
                        };

                        document.getElementById("d-status-indicator").style.backgroundColor =
                            statusColors[data.discord_status] || "#747f8d";

                        const customStatus = data.activities.find((a) => a.type === 4);

                        if (customStatus) {
                            let text = "";
                            const statusIcon = document.getElementById("d-status-icon");

                            if (customStatus.emoji) {
                                if (customStatus.emoji.id) {
                                    const ext = customStatus.emoji.animated ? "gif" : "png";
                                    statusIcon.src = `https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${ext}`;
                                    statusIcon.style.display = "block";
                                } else {
                                    text += customStatus.emoji.name + " ";
                                    statusIcon.style.display = "none";
                                }
                            } else {
                                statusIcon.style.display = "none";
                            }

                            if (customStatus.state) text += customStatus.state;
                            document.getElementById("d-status-text").textContent =
                                text || (data.discord_status === "offline" ? "Offline" : "Online");
                        } else {
                            document.getElementById("d-status-icon").style.display = "none";
                            document.getElementById("d-status-text").textContent =
                                data.discord_status === "offline" ? "Offline" : "Online";
                        }
                    }
                }
            };

            ws.onclose = () => {
                setTimeout(connectLanyard, 5000);
            };
        }

        connectLanyard();
    } else {
        document.getElementById("d-status-text").textContent = "Please add your Discord ID in config.js";
    }

    document.getElementById("link-spotify").href = CONFIG.socials.spotify;
    document.getElementById("link-tiktok").href = CONFIG.socials.tiktok;
    document.getElementById("link-apple").href = CONFIG.socials.apple;

    // Music
    document.getElementById("song-title-text").textContent = CONFIG.songTitle;
    document.getElementById("audio-source").src = CONFIG.audioSrc;

    const albumArtEl = document.getElementById("player-album-art");
    if (albumArtEl && CONFIG.albumArt) {
        albumArtEl.src = CONFIG.albumArt;
    }

    const audio = document.getElementById("bg-music");
    audio.load();

    // Custom cursor and water tail
    const cursor = document.getElementById("cursor");
    const canvas = document.getElementById("water-tail");
    const ctx = canvas ? canvas.getContext("2d") : null;

    if (cursor) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;
        // Extremely realistic Rippling Water effect
        let ripples = [];
        let r_lastTime = 0;

        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });
        }

        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.opacity = "1";

            if (canvas) {
                let now = Date.now();
                if (now - r_lastTime > 400) { // Very slow bubble creation rate (less frequent)
                    ripples.push({
                        x: mouseX,
                        y: mouseY,
                        radius: 0,
                        maxRadius: Math.random() * 20 + 50, // Don't expand too huge
                        speed: Math.random() * 0.2 + 0.3, // Very slow expansion speed
                        life: 1, // Full opacity
                        thickness: 2 // Clear neon line thickness
                    });
                    r_lastTime = now;
                }
            }
        });

        document.addEventListener("mouseleave", () => {
            cursor.style.opacity = "0";
        });

        document.addEventListener("mouseenter", () => {
            cursor.style.opacity = "1";
        });

        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.35;
            cursorY += (mouseY - cursorY) * 0.35;

            cursor.style.left = cursorX + "px";
            cursor.style.top = cursorY + "px";

            // Draw hyper-realistic ripples
            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                for (let i = ripples.length - 1; i >= 0; i--) {
                    let r = ripples[i];
                    r.radius += r.speed;
                    // Ease-out life (fade slower initially, faster at the end)
                    let progress = r.radius / r.maxRadius;
                    r.life = 1 - Math.pow(progress, 1.5);
                    
                    if (r.life <= 0) {
                        ripples.splice(i, 1);
                        continue;
                    }
                    
                    // Clear realistic Neon Red ripple (No heavy blur, sharp and bright)
                    ctx.beginPath();
                    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                    ctx.lineWidth = r.thickness; 
                    
                    // Main bright solid red line
                    ctx.strokeStyle = `rgba(255, 0, 0, ${r.life})`; 
                    
                    // Subtle sharp neon glow
                    ctx.shadowColor = `rgba(255, 0, 0, ${r.life * 0.8})`;
                    ctx.shadowBlur = 5; // Low blur for clear edge
                    
                    ctx.stroke();
                }
            }

            requestAnimationFrame(animateCursor);
        }

        animateCursor();

        const clickables = document.querySelectorAll("a, button, .discord-card, .progress-bar-bg, .player-buttons i, input, .social-icon");
        clickables.forEach((el) => {
            el.addEventListener("mouseenter", () => cursor.classList.add("cursor-hover"));
            el.addEventListener("mouseleave", () => cursor.classList.remove("cursor-hover"));
        });

        const spotifyBox = document.querySelector(".premium-spotify-box");
        if (spotifyBox) {
            spotifyBox.addEventListener("mouseenter", () => cursor.classList.add("hide-cursor"));
            spotifyBox.addEventListener("mouseleave", () => cursor.classList.remove("hide-cursor"));
        }

        const appleBox = document.querySelector(".premium-apple-box");
        if (appleBox) {
            appleBox.addEventListener("mouseenter", () => cursor.classList.add("hide-cursor"));
            appleBox.addEventListener("mouseleave", () => cursor.classList.remove("hide-cursor"));
        }
    }

    const enterScreen = document.getElementById("enter-screen");
    const enterBtn = document.querySelector(".enter-btn");
    const mainContent = document.getElementById("main-content");
    const audioToggle = document.getElementById("audio-toggle");
    const playPauseBtn = document.getElementById("play-pause-btn");

    let isPlaying = false;

    enterBtn.addEventListener("click", () => {
        // Request Device Orientation Permission for iOS 13+
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    }
                })
                .catch(console.error);
        } else {
            // For other mobile devices
            window.addEventListener('deviceorientation', handleOrientation);
        }

        // Play audio and video strictly on user gesture matching (fixes iOS and Safari pausing)
        audio.volume = 0.5;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updatePlayPauseIcon();
            }).catch(() => {
                console.log("Audio permission denied.");
            });
        }

        if (isVideo) {
            bgVideo.play().catch(() => console.log("Background video play skipped."));
        }

        enterScreen.classList.add("enter-leaving");

        setTimeout(() => {
            enterScreen.style.display = "none";
            document.body.classList.add("scroll-enabled");
            mainContent.classList.remove("hidden");
            
            // Apply staggering entry animation to main content blocks
            const blocksToAnimate = [
                document.querySelector(".container"),
                document.getElementById("view-counter-box"),
                document.getElementById("apple-wrapper"),
                document.getElementById("spotify-wrapper"),
                document.getElementById("obscura-section"),
                document.querySelector(".spotify-tape-container"),
                document.querySelector(".bottom-social-section"),
                document.querySelector(".tape-copyright")
            ];
            
            blocksToAnimate.forEach((block, index) => {
                if (block) {
                    block.style.opacity = "0";
                    block.style.animation = `mainEntrance 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) ${0.2 + (index * 0.15)}s forwards`;
                }
            });
            
            const obscuraSection = document.getElementById("obscura-section");
            if (obscuraSection) obscuraSection.classList.remove("hidden");

            const viewCounterBox = document.getElementById("view-counter-box");
            if (viewCounterBox) viewCounterBox.classList.remove("hidden");
        }, 1100); // Wait for the 1.2s exit animation to almost finish before showing new content
    });

    // Enforce video playback continuously
    setInterval(() => {
        if (isVideo && bgVideo.paused) {
            bgVideo.play().catch(() => {});
        }
    }, 1000);

    audioToggle.addEventListener("click", () => {
        audio.muted = !audio.muted;
        audioToggle.innerHTML = audio.muted
            ? '<i class="fa-solid fa-volume-xmark"></i>'
            : '<i class="fa-solid fa-volume-high"></i>';
    });

    const volumeSlider = document.getElementById("volume-slider");
    if (volumeSlider) {
        volumeSlider.addEventListener("input", (e) => {
            const vol = e.target.value / 100;
            audio.volume = vol;

            if (vol === 0) {
                audio.muted = true;
                audioToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            } else {
                audio.muted = false;
                audioToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            }
        });
    }

    // Player math
    const progressBarBg = document.getElementById("progress-bar-bg");
    const progressBarFill = document.getElementById("progress-bar-fill");
    const currentTimeEl = document.getElementById("current-time");
    const totalTimeEl = document.getElementById("total-time");

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }

    audio.addEventListener("loadedmetadata", () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progressBarFill.style.width = progressPercent + "%";
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });

    progressBarBg.addEventListener("click", (e) => {
        const width = progressBarBg.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    });

    playPauseBtn.addEventListener("click", () => {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
        } else {
            audio.play();
            isPlaying = true;
        }
        updatePlayPauseIcon();
    });

    function updatePlayPauseIcon() {
        playPauseBtn.className = isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
    }

    // Rain
    const rainContainer = document.getElementById("rain-container");

    function createRaindrop() {
        if (document.hidden) return;

        const drop = document.createElement("div");
        drop.classList.add("raindrop");
        // Start from -20vw up to 130vw to account for the angled fall
        drop.style.left = (Math.random() * 150 - 20) + "vw";

        const duration = Math.random() * 0.3 + 0.2; // Faster drops
        drop.style.animationDuration = duration + "s";
        drop.style.opacity = Math.random() * 0.45 + 0.1;
        drop.style.height = (Math.random() * 40 + 60) + "px";

        // Add depth to realistic rain (some drops closer/blurred)
        const depth = Math.random();
        if (depth < 0.3) {
            drop.style.filter = "blur(1.5px)";
            drop.style.zIndex = "1";
        } else if (depth > 0.8) {
            drop.style.filter = "blur(3px)";
            drop.style.zIndex = "3";
        } else {
            drop.style.zIndex = "-1";
        }

        rainContainer.appendChild(drop);
        setTimeout(() => drop.remove(), duration * 1000);
    }

    setInterval(createRaindrop, 25);

    // Global Local Time
    function updateLocalTime() {
        const timeBox = document.getElementById("local-time");
        if (timeBox) {
            const now = new Date();
            // Format time dynamically for the user's specific timezone (country)
            const timeString = now.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            timeBox.textContent = timeString;
        }
    }
    
    // Initial call
    updateLocalTime();
    // Update every second
    setInterval(updateLocalTime, 1000);

    // Mobile scroll animation for premium widgets
    const premiumWidgets = document.querySelectorAll(".premium-spotify-box, .premium-apple-box");
    if (premiumWidgets.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                } else {
                    entry.target.classList.remove("in-view");
                }
            });
        }, {
            threshold: 0.3 // Trigger when 30% of the widget is visible
        });
        
        premiumWidgets.forEach(widget => observer.observe(widget));
    }

    // Scroll animation for Discord cards
    const obscuraCards = document.querySelectorAll(".discord-profile-card");
    if (obscuraCards.length > 0) {
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add("in-view");
                    }, index * 200); // Staggered reveal effect
                }
            });
        }, {
            threshold: 0.2
        });
        
        obscuraCards.forEach(card => cardObserver.observe(card));
    }

    // Scroll animation for regular elements (Title, Desc, Button)
    const scrollElements = document.querySelectorAll(".scroll-animate");
    if (scrollElements.length > 0) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                }
            });
        }, {
            threshold: 0.1
        });

        scrollElements.forEach(el => scrollObserver.observe(el));
    }

    // Realistic Wind Effect for Enter Screen
    function initWindEffect() {
        const windContainer = document.getElementById("wind-container");
        if (!windContainer) return;

        let isRunning = true;

        function createParticle(isDust) {
            if (!isRunning) return;
            const particle = document.createElement("div");
            particle.classList.add(isDust ? "wind-dust" : "wind-streak");
            
            particle.style.top = Math.random() * 100 + "%";
            
            if (!isDust) {
                particle.style.width = (Math.random() * 200 + 50) + "px";
                particle.style.animationDuration = (Math.random() * 0.5 + 0.3) + "s";
                particle.style.opacity = Math.random() * 0.3 + 0.1;
            } else {
                const size = (Math.random() * 3 + 2) + "px";
                particle.style.width = size;
                particle.style.height = size;
                particle.style.setProperty("--drift-y", (Math.random() * 40 - 20) + "vh");
                particle.style.animationDuration = (Math.random() * 1.5 + 0.5) + "s";
                particle.style.opacity = Math.random() * 0.5 + 0.2;
            }

            windContainer.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) particle.remove();
            }, parseInt(particle.style.animationDuration) * 1000); // Wait for animation to finish
        }

        // Generate particles occasionally
        const streakInterval = setInterval(() => createParticle(false), 80);
        const dustInterval = setInterval(() => createParticle(true), 40);

        // Stop wind and clean up when entering site
        const enterBtn = document.querySelector(".enter-btn");
        if (enterBtn) {
            enterBtn.addEventListener("click", () => {
                isRunning = false;
                clearInterval(streakInterval);
                clearInterval(dustInterval);
            });
        }
    }
    
    initWindEffect();
});
