
        // ══ UNIFIED LIKES + VIEWS SYSTEM ══
        (function(){
          var BIN_ID  = '6a093480adc21f119ab0434f';
          var API_KEY = '$2a$10$GPwrG6ak65GPsAXu0GMe1eyc2pFsiS9iaIAfQS3BT94Y1qgiy5UFy';
          var BASE    = 'https://api.jsonbin.io/v3/b/' + BIN_ID;
          var HEADERS = { 'Content-Type': 'application/json', 'X-Access-Key': API_KEY };

          var liked    = false;
          var likesVal = 0;
          var viewsVal = 0;
          var busy     = false;

          var btn    = document.getElementById('dc-like-btn');
          var heart  = document.getElementById('dc-like-heart');
          var cntEl  = document.getElementById('dc-like-count');
          var viewEl = document.getElementById('dc-view-count');

          function applyLikedUI(isLiked) {
            liked = isLiked;
            if (isLiked) btn.classList.add('liked');
            else btn.classList.remove('liked');
          }

          function animateHeart() {
            heart.classList.remove('like-pop-anim');
            void heart.offsetWidth;
            heart.classList.add('like-pop-anim');
          }

          // Selalu simpan likes + views bareng supaya tidak saling overwrite
          function saveBin(newLikes, newViews) {
            return fetch(BASE, {
              method: 'PUT',
              headers: HEADERS,
              body: JSON.stringify({ likes: newLikes, views: newViews })
            })
            .then(r => r.json())
            .then(j => j.record);
          }

          // ── SATU fetch saat load — urus views + likes sekaligus, no race condition ──
          fetch(BASE + '/latest', { headers: { 'X-Access-Key': API_KEY } })
            .then(r => {
              if (!r.ok) throw new Error('fetch failed: ' + r.status);
              return r.json();
            })
            .then(j => {
              likesVal = (j.record && j.record.likes) ? j.record.likes : 0;
              viewsVal = (j.record && j.record.views) ? j.record.views : 0;

              if (sessionStorage.getItem('neysa_liked') === '1') applyLikedUI(true);
              cntEl.textContent = likesVal;

              // Increment views 1x per sesi browser
              if (!sessionStorage.getItem('neysa_viewed')) {
                sessionStorage.setItem('neysa_viewed', '1');
                viewsVal++;
                saveBin(likesVal, viewsVal).catch(() => {});
              }
              if (viewEl) viewEl.textContent = viewsVal.toLocaleString();
            })
            .catch(() => {
              cntEl.textContent = likesVal;
              if (viewEl) viewEl.textContent = '0';
            });

          window.toggleProfileLike = function(){
            if (busy) return;
            busy = true;

            var willLike = !liked;

            if (!willLike && sessionStorage.getItem('neysa_liked') !== '1') {
              busy = false;
              return;
            }

            var newLikes = willLike ? likesVal + 1 : Math.max(0, likesVal - 1);

            // Optimistic UI
            likesVal = newLikes;
            cntEl.textContent = likesVal;
            applyLikedUI(willLike);
            animateHeart();

            if (willLike) sessionStorage.setItem('neysa_liked', '1');
            else sessionStorage.removeItem('neysa_liked');

            // Simpan likes baru + views terkini — keduanya aman
            saveBin(newLikes, viewsVal)
              .then(record => {
                likesVal = record.likes || newLikes;
                viewsVal = record.views || viewsVal;
                cntEl.textContent = likesVal;
              })
              .catch(() => {})
              .finally(() => { busy = false; });
          };
        })();
      

/* ============================= */


  /* ── Playlist row click: highlight + open YouTube Music search ── */
  document.querySelectorAll('.pl-item').forEach(item => {
    item.addEventListener('click', e => {
      if(e.target.closest('.pl-open-btn')) return; // let the link handle itself
      document.querySelectorAll('.pl-item').forEach(i => i.classList.remove('pl-active'));
      item.classList.add('pl-active');
      const q = item.dataset.search;
      if(q) window.open('https://music.youtube.com/search?q=' + encodeURIComponent(q), '_blank');
    });
  });


/* ============================= */


  /* ── CURSOR ── */
  const dot  = document.getElementById('cur-dot');
  const ring = document.getElementById('cur-ring');
  const glow = document.getElementById('cur-glow');
  let mx=0,my=0,rx=0,ry=0;

  /* pink sparkle colours */
  const sparkleColors = ['#ff69b4','#ffb3d9','#ff85c2','#ffd6ec','#ff4da6','#ffcce5','#ff99cc'];
  let lastSparkleTime = 0;

  document.addEventListener('mousemove',e=>{
    mx=e.clientX; my=e.clientY;
    dot.style.left=mx+'px'; dot.style.top=my+'px';
    glow.style.left=mx+'px'; glow.style.top=my+'px';

    /* spawn sparkle particles on move (throttled) */
    const now = Date.now();
    if(now - lastSparkleTime < 30) return;
    lastSparkleTime = now;

    const count = 2 + Math.floor(Math.random()*2);
    for(let i=0;i<count;i++){
      const sp = document.createElement('div');
      sp.className = 'pink-sparkle';
      const sz = 3 + Math.random()*5;
      const color = sparkleColors[Math.floor(Math.random()*sparkleColors.length)];
      const dur = 500 + Math.random()*600;
      const dx = (Math.random()-0.5)*40;
      const dy = 20 + Math.random()*50; /* mostly fall downward */
      sp.style.cssText = `
        left:${mx}px; top:${my}px;
        width:${sz}px; height:${sz}px;
        background:${color};
        box-shadow:0 0 ${sz*1.5}px ${color};
        --dx:${dx}px; --dy:${dy}px;
        animation-duration:${dur}ms;
      `;
      /* star shape for some */
      if(Math.random()>0.5){
        sp.style.borderRadius='2px';
        sp.style.transform=`translate(-50%,-50%) rotate(${Math.random()*45}deg)`;
      }
      document.body.appendChild(sp);
      setTimeout(()=>sp.remove(), dur+50);
    }
  });
  (function lerpRing(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(lerpRing)})();

  /* ── DOT BURST ── */
  document.querySelectorAll('.timeline-dot').forEach(d=>{
    d.addEventListener('click',function(){
      const r=this.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
      for(let i=0;i<12;i++){
        const p=document.createElement('span');const sz=4+Math.random()*4;
        p.style.cssText=`position:fixed;left:${cx}px;top:${cy}px;width:${sz}px;height:${sz}px;border-radius:50%;background:${i%2?'#58c8f5':'#3a9fd4'};pointer-events:none;z-index:9999;transform:translate(-50%,-50%)`;
        document.body.appendChild(p);
        const a=(i/12)*2*Math.PI+Math.random()*.3,dist=35+Math.random()*35;
        const dx=Math.cos(a)*dist,dy=Math.sin(a)*dist,dur=480+Math.random()*220;
        let t0=null;
        (function run(ts){if(!t0)t0=ts;const t=(ts-t0)/dur;if(t>=1){p.remove();return}const e=1-t*t;p.style.transform=`translate(calc(-50% + ${dx*(1-e)}px),calc(-50% + ${dy*(1-e)}px))`;p.style.opacity=(1-t).toFixed(3);requestAnimationFrame(run)})(performance.now());
      }
    });
  });

  /* ── CURSOR GLOW FOLLOW for timeline items ── */
  document.querySelectorAll('.timeline-item').forEach(item => {
    const glow = item.querySelector('.tl-cursor-glow');
    if (!glow) return;
    item.addEventListener('mousemove', e => {
      const rect = item.getBoundingClientRect();
      glow.style.left = (e.clientX - rect.left) + 'px';
      glow.style.top  = (e.clientY - rect.top)  + 'px';
    });
  });

  /* ── SELECTED WORK SLIDER ── */
  const track   = document.getElementById('sw-track');
  const catTitle= document.getElementById('sw-cat-title');
  const catSub  = document.getElementById('sw-cat-sub');
  const dotsWrap= document.getElementById('sw-dots');
  const cards   = track.querySelectorAll('.sw-card');
  const total   = cards.length;
  let cur = 0;

  const categories = [
    {title:'EDITING',    sub:'Cinematic · Speed Ramp · PMV · 3D'},
    {title:'PMV',        sub:'AMV · Motion Sync · Anime'},
    {title:'3D MOTION',  sub:'Blender · Logo Animation · VFX'},
    {title:'SPEED RAMP', sub:'Montage · Transitions · Premiere'},
    {title:'DESIGN',     sub:'Branding · Visual · Graphic'},
  ];

  /* build dots */
  for(let i=0;i<total;i++){
    const d=document.createElement('div');
    d.className='sw-dot'+(i===0?' active':'');
    d.onclick=()=>goTo(i);
    dotsWrap.appendChild(d);
  }

  function goTo(idx){
    cur=Math.max(0,Math.min(idx,total-1));
    const cardW = cards[0].getBoundingClientRect().width+20;
    track.style.transform=`translateX(-${cur*cardW}px)`;

    dotsWrap.querySelectorAll('.sw-dot').forEach((d,i)=>d.classList.toggle('active',i===cur));
    document.getElementById('sw-prev').disabled=cur===0;
    document.getElementById('sw-next').disabled=cur===total-1;
  }

  function swMove(dir){goTo(cur+dir)}

  /* add transition to text */
  catTitle.style.transition='opacity .2s ease';
  if(catSub) catSub.style.transition='opacity .2s ease';

  /* init */
  goTo(0);
  window.addEventListener('resize',()=>goTo(cur));

  /* ── VIDEO VOLUME CONTROL ── */
  const bgVideo   = document.getElementById('bg-video');
  const volSlider = document.getElementById('vol-slider');
  const volBtn    = document.getElementById('vol-btn');
  const volWave1  = document.getElementById('vol-wave1');
  const volWave2  = document.getElementById('vol-wave2');
  let lastVol = 0.5;

  // Video tidak dimulai dulu — tunggu user klik enter overlay
  bgVideo.muted  = true;
  bgVideo.volume = 0.5;
  bgVideo.pause();

  function updateSliderTrack(v){
    const pct = v * 100;
    volSlider.style.background = `linear-gradient(90deg,var(--accent) ${pct}%,rgba(58,159,212,.25) ${pct}%)`;
  }

  function setMuteIcon(muted){
    volWave1.style.display = muted ? 'none' : '';
    volWave2.style.display = muted ? 'none' : '';
    const existX = document.getElementById('vol-x');
    if(muted && !existX){
      const x = document.createElementNS('http://www.w3.org/2000/svg','g');
      x.id='vol-x';
      x.innerHTML='<line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2"/><line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2"/>';
      document.querySelector('#vol-icon').appendChild(x);
    } else if(!muted && existX){ existX.remove(); }
  }

  volSlider.addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    bgVideo.volume = v;
    bgVideo.muted  = v === 0;
    lastVol = v > 0 ? v : lastVol;
    updateSliderTrack(v);
    setMuteIcon(v === 0);
  });

  volBtn.addEventListener('click', () => {
    if(bgVideo.muted || bgVideo.volume === 0){
      bgVideo.muted  = false;
      bgVideo.volume = lastVol || 0.5;
      volSlider.value = bgVideo.volume;
    } else {
      lastVol = bgVideo.volume;
      bgVideo.muted = true;
      volSlider.value = 0;
    }
    updateSliderTrack(parseFloat(volSlider.value));
    setMuteIcon(bgVideo.muted || bgVideo.volume === 0);
  });

  // Set UI awal: muted
  updateSliderTrack(0);
  setMuteIcon(true);

  /* ── Enter Overlay + Start Video + Unmute saat klik ── */
  let autoUnmuteDone = false;

  const enterOverlay = document.getElementById('enter-overlay');

  function autoUnmute(){
    if(autoUnmuteDone) return;
    autoUnmuteDone = true;

    // Fade out overlay
    enterOverlay.classList.add('hiding');
    setTimeout(() => enterOverlay.remove(), 850);

    // Start video + unmute langsung (user gesture membolehkan audio)
    bgVideo.muted  = false;
    bgVideo.volume = 0;
    bgVideo.play().then(() => {
      // Fade in volume perlahan supaya tidak kaget
      let vol = 0;
      const fadeIn = setInterval(() => {
        vol = Math.min(vol + 0.05, 0.5);
        bgVideo.volume = vol;
        volSlider.value = vol;
        updateSliderTrack(vol);
        if(vol >= 0.5){
          clearInterval(fadeIn);
          setMuteIcon(false);
        }
      }, 40);
    }).catch(() => {
      // Fallback jika play gagal: tetap coba unmute
      bgVideo.muted  = false;
      bgVideo.volume = 0.5;
      volSlider.value = 0.5;
      updateSliderTrack(0.5);
      setMuteIcon(false);
    });

    ['click','keydown','touchstart'].forEach(ev =>
      document.removeEventListener(ev, autoUnmute)
    );
  }
  ['click','keydown','touchstart'].forEach(ev =>
    document.addEventListener(ev, autoUnmute)
  );


  /* ── VIDEO SHOWCASE SLIDER ── */
  (function(){
    const vsTrack    = document.getElementById('vs-track');
    const vsDotsWrap = document.getElementById('vs-dots');
    if(!vsTrack) return;
    const vsCards = Array.from(vsTrack.querySelectorAll('.vs-card'));
    const vsTotal = vsCards.length;
    let vsCur = 0;
    let activeVideoCard = null;

    /* build dots */
    for(let i=0;i<vsTotal;i++){
      const d=document.createElement('div');
      d.className='sw-dot'+(i===0?' active':'');
      d.onclick=()=>vsGoTo(i);
      vsDotsWrap.appendChild(d);
    }

    function vsGoTo(idx){
      vsCur=Math.max(0,Math.min(idx,vsTotal-1));
      // Calculate cumulative offset to the target card (cards may have different widths)
      let offsetX = 0;
      for(let i=0;i<vsCur;i++){
        const rect=vsCards[i].getBoundingClientRect();
        offsetX+=rect.width+20; // 20 = gap
      }
      vsTrack.style.transform=`translateX(-${offsetX}px)`;
      vsDotsWrap.querySelectorAll('.sw-dot').forEach((d,i)=>d.classList.toggle('active',i===vsCur));
      document.getElementById('vs-prev').disabled=vsCur===0;
      document.getElementById('vs-next').disabled=vsCur===vsTotal-1;
    }
    window.vsMove=function(dir){vsGoTo(vsCur+dir)};
    vsGoTo(0);
    window.addEventListener('resize',()=>vsGoTo(vsCur));

    /* ── Toast helper ── */
    let toastTimer=null;
    function showVsToast(msg){
      const toast=document.getElementById('vs-mute-toast');
      if(!toast)return;
      toast.textContent=msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer=setTimeout(()=>toast.classList.remove('show'),2800);
    }

    /* ── Smooth fade helpers for bg audio ── */
    let fadeInterval=null;
    function fadeBgTo(targetVol,onDone){
      clearInterval(fadeInterval);
      const step=0.04;
      fadeInterval=setInterval(()=>{
        const curr=bgVideo.muted?0:bgVideo.volume;
        if(Math.abs(curr-targetVol)<step+0.001){
          if(targetVol===0){ bgVideo.muted=true; bgVideo.volume=bgVideo._vsPrevVol||0.5; }
          else { bgVideo.volume=targetVol; bgVideo.muted=false; }
          clearInterval(fadeInterval);
          if(onDone)onDone();
        } else {
          bgVideo.muted=false;
          bgVideo.volume=Math.max(0,Math.min(1,curr+(targetVol>curr?step:-step)));
        }
      },30);
    }

    function muteBackground(forceNotMuted){
      // Save prev volume BEFORE any fade — use stored value if volume already faded to 0
      const curVol = bgVideo.muted ? 0 : bgVideo.volume;
      const wasActuallyMuted = !forceNotMuted && curVol === 0 && !bgVideo._vsPrevVol;
      if(!wasActuallyMuted){
        // Always preserve the last known real volume
        if(curVol > 0) bgVideo._vsPrevVol = curVol;
        bgVideo._vsWasMuted = false;
        clearInterval(fadeInterval);
        bgVideo.muted = false;
        fadeBgTo(0);
      } else {
        bgVideo._vsWasMuted = true;
      }
      updateSliderTrack(0);
      setMuteIcon(true);
    }

    function restoreBackground(){
      if(!bgVideo._vsWasMuted){
        const tgt=bgVideo._vsPrevVol||0.5;
        clearInterval(fadeInterval);
        bgVideo.muted=false;
        bgVideo.volume=0;
        fadeBgTo(tgt,()=>{
          updateSliderTrack(tgt);
          setMuteIcon(false);
        });
      }
    }

    /* ── Per-card play/pause toggle ── */
    vsCards.forEach(card=>{
      const overlay=card.querySelector('.vs-play-overlay');
      const video=card.querySelector('.vs-video');
      if(!overlay||!video)return;

      /* ── Detect aspect ratio after metadata loads, apply CSS class ── */
      function applyAspectClass(){
        const w=video.videoWidth, h=video.videoHeight;
        if(!w||!h)return;
        // Set aspect-ratio exactly matching the video's native dimensions
        const wrap = card.querySelector('.vs-video-wrap');
        wrap.style.aspectRatio = w + '/' + h;
        // Also keep a class for any CSS that needs it
        const ratio=w/h;
        card.classList.remove('portrait','landscape','square');
        if(ratio<0.75)      card.classList.add('portrait');
        else if(ratio>1.2)  card.classList.add('landscape');
        else                card.classList.add('square');
        vsGoTo(vsCur); // recalc slider after size settles
      }
      if(video.readyState>=1){ applyAspectClass(); }
      else { video.addEventListener('loadedmetadata', applyAspectClass, {once:true}); }

      overlay.addEventListener('click',()=>{
        const isPlaying=!video.paused;
        if(isPlaying){
          video.pause();
          card.classList.remove('playing');
          activeVideoCard=null;
          restoreBackground();
          showVsToast('⏸ Video dijeda — background music kembali');
        } else {
          // Stop any other playing video
          if(activeVideoCard&&activeVideoCard!==card){
            const prevVid=activeVideoCard.querySelector('.vs-video');
            if(prevVid)prevVid.pause();
            activeVideoCard.classList.remove('playing');
          }
          video.muted=false;
          const playPromise=video.play();
          if(playPromise!==undefined){
            playPromise.catch(()=>{
              video.muted=true;
              video.play().catch(()=>{});
              showVsToast('🔇 Klik sekali lagi untuk suara penuh');
            });
          }
          card.classList.add('playing');
          activeVideoCard=card;
          // forceNotMuted=true: always save _vsPrevVol even if bg is mid-fade (volume already 0)
          muteBackground(true);
          showVsToast('▶ Video diputar — background music dimuted');
        }
      });

      video.addEventListener('ended',()=>{
        card.classList.remove('playing');
        if(activeVideoCard===card){ activeVideoCard=null; restoreBackground(); }
      });
    });

    // Pause on tab hidden
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden&&activeVideoCard){
        const vid=activeVideoCard.querySelector('.vs-video');
        if(vid&&!vid.paused){ vid.pause(); activeVideoCard.classList.remove('playing'); activeVideoCard=null; restoreBackground(); }
      }
    });
  })();


  /* ── BATAM LIVE CLOCK (UTC+7) ── */
  function updateBatamClock(){
    // Batam = WIB = UTC+7
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const batam = new Date(utc + 7 * 3600000);

    const hh = String(batam.getHours()).padStart(2,'0');
    const mm = String(batam.getMinutes()).padStart(2,'0');
    const ss = String(batam.getSeconds()).padStart(2,'0');
    document.getElementById('clock-time').textContent = hh+':'+mm+':'+ss;

    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayName  = days[batam.getDay()];
    const monthName= months[batam.getMonth()];
    const date     = batam.getDate();
    const year     = batam.getFullYear();
    document.getElementById('clock-date').textContent = dayName+', '+monthName+' '+date+', '+year;
  }
  updateBatamClock();
  setInterval(updateBatamClock, 1000);


  // View counter sudah digabung ke unified system di atas

  /* ── LANYARD DISCORD PRESENCE ── */
  const DISCORD_ID = '845891093010055258';

  const statusColors = {online:'online', idle:'idle', dnd:'dnd', offline:'offline'};

  function getActivityIcon(activity) {
    if (activity.assets && activity.assets.large_image) {
      const img = activity.assets.large_image;
      if (img.startsWith('mp:external/')) {
        return 'https://media.discordapp.net/external/' + img.slice('mp:external/'.length);
      }
      if (img.startsWith('spotify:')) {
        return 'https://i.scdn.co/image/' + img.slice('spotify:'.length);
      }
      return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${img}.png`;
    }
    return null;
  }

  /* ── TYPEWRITER BIO ANIMATION ── */
  const bioLines = [
    'Motion & Video Editor',
    'Visual Designer & Web Creator',
    'Love Must End With Love, Right?',
    '3D Logo Animator',
  ];
  let bioLineIdx = 0, bioCharIdx = 0, bioDeleting = false;
  const bioTextEl = document.getElementById('dc-bio-text');

  function typeBio() {
    const line = bioLines[bioLineIdx];
    if (!bioDeleting) {
      bioCharIdx++;
      bioTextEl.textContent = line.slice(0, bioCharIdx);
      if (bioCharIdx === line.length) {
        bioDeleting = true;
        setTimeout(typeBio, 1800);
        return;
      }
      setTimeout(typeBio, 55);
    } else {
      bioCharIdx--;
      bioTextEl.textContent = line.slice(0, bioCharIdx);
      if (bioCharIdx === 0) {
        bioDeleting = false;
        bioLineIdx = (bioLineIdx + 1) % bioLines.length;
        setTimeout(typeBio, 400);
        return;
      }
      setTimeout(typeBio, 28);
    }
  }
  typeBio();

  async function fetchPresence() {
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
      const json = await res.json();
      if (!json.success) return;

      const d = json.data;

      // ── Avatar
      const avatarUrl = d.discord_user.avatar
        ? `https://cdn.discordapp.com/avatars/${d.discord_user.id}/${d.discord_user.avatar}.png?size=256`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(d.discord_user.discriminator || 0) % 5}.png`;

      const placeholder = document.getElementById('dc-profile-photo-placeholder');
      if (placeholder) {
        const img = document.createElement('img');
        img.className = 'dc-profile-avatar-img';
        img.src = avatarUrl;
        img.alt = 'avatar';
        placeholder.replaceWith(img);
      }

      // ── Name from Discord
      document.getElementById('dc-profile-name').textContent = d.discord_user.global_name || d.discord_user.username;
      document.getElementById('dc-profile-handle').textContent = '@' + d.discord_user.username;

      // ── Status
      const statusClass = statusColors[d.discord_status] || 'offline';
      document.getElementById('dc-hero-status').className = 'dc-status-badge ' + statusClass;

      // ── Activity (2 cards: app + music)
      const activities = (d.activities || []).filter(a => a.type !== 4);
      const appAct   = activities.find(a => a.type !== 2); // Playing/Watching/etc
      const musicAct = activities.find(a => a.type === 2); // Listening to
      const actRow   = document.getElementById('dc-activity-row');

      const cardApp   = document.getElementById('act-card-app');
      const cardMusic = document.getElementById('act-card-music');

      const anyActive = appAct || musicAct;
      actRow.style.display = anyActive ? 'flex' : 'none';

      // ── App card
      if (appAct) {
        cardApp.style.display = 'flex';
        const typeLabel = ['Playing','Streaming','Listening to','Watching','','Competing in'];
        document.getElementById('act-app-label').textContent  = typeLabel[appAct.type] || 'Playing';
        document.getElementById('act-app-name').textContent   = appAct.name || '';
        document.getElementById('act-app-detail').textContent = appAct.details || '';
        document.getElementById('act-app-state').textContent  = appAct.state || '';
        const appImg = document.getElementById('act-app-img');
        const appIcon = getActivityIcon(appAct);
        if (appIcon) { appImg.src = appIcon; appImg.style.display = 'block'; }
        else { appImg.style.display = 'none'; }
      } else { cardApp.style.display = 'none'; }

      // ── Music card
      if (musicAct) {
        cardMusic.style.display = 'flex';
        document.getElementById('act-music-name').textContent   = musicAct.details || musicAct.name || '';
        document.getElementById('act-music-artist').textContent = musicAct.state || '';
        document.getElementById('act-music-album').textContent  = (musicAct.assets && musicAct.assets.large_text) || '';

        const musicImg = document.getElementById('act-music-img');
        const musicIcon = getActivityIcon(musicAct);
        if (musicIcon) { musicImg.src = musicIcon; musicImg.style.display = 'block'; }
        else { musicImg.style.display = 'none'; }

        // Progress bar
        if (musicAct.timestamps && musicAct.timestamps.start && musicAct.timestamps.end) {
          const start = musicAct.timestamps.start;
          const end   = musicAct.timestamps.end;
          const now   = Date.now();
          const elapsed = Math.max(0, now - start);
          const total   = end - start;
          const pct     = Math.min(100, (elapsed / total) * 100);
          const fmt = ms => { const s=Math.floor(ms/1000); return Math.floor(s/60)+':'+(s%60).toString().padStart(2,'0'); };
          document.getElementById('act-music-fill').style.width    = pct + '%';
          document.getElementById('act-music-elapsed').textContent = fmt(elapsed);
          document.getElementById('act-music-total').textContent   = fmt(total);
          document.getElementById('act-music-progress').style.display = 'flex';
        } else {
          document.getElementById('act-music-progress').style.display = 'none';
        }
      } else { cardMusic.style.display = 'none'; }

    } catch(e) { /* silent fail */ }
  }

  fetchPresence();
  setInterval(fetchPresence, 10000); // refresh every 10s

  /* ── DISCORD SERVER (via invite code) ── */
  // ✏️ GANTI LINK INVITE DI SINI:
  const INVITE_LINK = 'https://discord.gg/d5PMRD2Bnp';

  async function fetchServerByInvite() {
    try {
      const code = INVITE_LINK.trim().split('/').pop();
      const res = await fetch(`https://discord.com/api/v9/invites/${code}?with_counts=true&with_expiration=true`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.guild) return;

      const guild = data.guild;
      const approx_online = data.approximate_presence_count || 0;
      const approx_total  = data.approximate_member_count  || 0;

      const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };

      // Card server
      set('dc-server-name',   guild.name);
      set('dc-server-online', approx_online.toLocaleString() + ' Online');
      set('dc-server-total',  approx_total.toLocaleString() + '+ Members');

      // Link invite
      const cardEl = document.getElementById('dc-server-card');
      if (cardEl) cardEl.href = INVITE_LINK;

      // Icon server
      const iconEl = document.getElementById('dc-server-icon');
      if (iconEl && guild.icon) {
        const ext = guild.icon.startsWith('a_') ? 'gif' : 'png';
        iconEl.src = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=64`;
        iconEl.onerror = () => { iconEl.removeAttribute('src'); iconEl.style.background = 'linear-gradient(135deg,#5865f2,#3a44cc)'; };
      }

    } catch(e) { console.warn('Server fetch failed:', e); }
  }
  fetchServerByInvite();
  setInterval(fetchServerByInvite, 30000);

  /* ══ FALLING PETALS ══ */
  (function(){
    const container = document.getElementById('petal-canvas');
    if (!container) return;

    const COUNT = 18;

    function randomBetween(a, b){ return a + Math.random() * (b - a); }

    function createPetal(){
      const p = document.createElement('div');
      p.className = 'petal';

      const size = randomBetween(10, 22);
      const startX = randomBetween(-10, 100); // % across
      const duration = randomBetween(2.5, 5.5);
      const delay = randomBetween(0, 6);
      const drift = randomBetween(-30, 30);

      p.style.cssText = `
        left: ${startX}%;
        top: -20px;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        transform-origin: center center;
        filter: hue-rotate(${randomBetween(-20,20)}deg) brightness(${randomBetween(0.9,1.2)});
      `;

      // Add horizontal drift via custom keyframe using JS animation
      const glowColor = `rgba(255,${Math.floor(randomBetween(140,200))},${Math.floor(randomBetween(180,230))},0.9)`;
      const glowFaint = `rgba(255,150,200,0.3)`;
      p.animate([
        { transform: `translateY(-20px) translateX(0px) rotate(0deg) scale(${randomBetween(0.5,0.8)})`, opacity: 0, filter: `drop-shadow(0 0 2px ${glowColor})` },
        { transform: `translateY(20px) translateX(${drift*0.3}px) rotate(${randomBetween(60,120)}deg) scale(${randomBetween(0.7,1)})`, opacity: 0.9, filter: `drop-shadow(0 0 7px ${glowColor}) drop-shadow(0 0 14px ${glowFaint})`, offset: 0.15 },
        { transform: `translateY(80px) translateX(${drift*0.7}px) rotate(${randomBetween(180,260)}deg) scale(${randomBetween(0.8,1.1)})`, opacity: 0.7, filter: `drop-shadow(0 0 4px ${glowColor})`, offset: 0.75 },
        { transform: `translateY(130px) translateX(${drift}px) rotate(${randomBetween(300,400)}deg) scale(${randomBetween(0.5,0.9)})`, opacity: 0, filter: `drop-shadow(0 0 2px ${glowFaint})` },
      ], {
        duration: duration * 1000,
        delay: delay * 1000,
        iterations: Infinity,
        easing: 'ease-in',
      });

      container.appendChild(p);
    }

    for(let i = 0; i < COUNT; i++) createPetal();
  })();


  /* ── Global tooltip for data-tip elements (renders at body level, never clipped) ── */
  (function(){
    const tip = document.createElement('div');
    tip.id = 'global-tip';
    tip.style.cssText = `
      position:fixed;z-index:99999;pointer-events:none;
      background:rgba(8,14,28,0.92);
      border:1px solid rgba(88,200,245,.22);
      color:rgba(232,240,254,.85);
      font-family:'Space Mono',monospace;
      font-size:9px;letter-spacing:.08em;
      padding:5px 10px;border-radius:6px;
      white-space:nowrap;
      backdrop-filter:blur(10px);
      box-shadow:0 4px 16px rgba(0,0,0,.5);
      opacity:0;transition:opacity .15s ease;
      transform:translateX(-50%);
    `;
    document.body.appendChild(tip);

    // Only target .social-btn elements (others use CSS ::before)
    document.addEventListener('mouseover', e => {
      const el = e.target.closest('.social-btn[data-tip]');
      if (!el) return;
      tip.textContent = el.dataset.tip;
      tip.style.opacity = '1';
    });
    document.addEventListener('mousemove', e => {
      const el = e.target.closest('.social-btn[data-tip]');
      if (!el) { tip.style.opacity = '0'; return; }
      const rect = el.getBoundingClientRect();
      tip.style.left = (rect.left + rect.width / 2) + 'px';
      tip.style.top  = (rect.top - 36) + 'px';
    });
    document.addEventListener('mouseout', e => {
      if (!e.target.closest('.social-btn[data-tip]')) tip.style.opacity = '0';
    });
  })();



/* ============================= */


  function openPositions(){
    const el = document.getElementById('positions-overlay');
    el.classList.add('open');
    el.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }
  function closePositions(){
    document.getElementById('positions-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', e => { if(e.key==='Escape') closePositions(); });


/* ============================= */


  function openServices(){
    const el = document.getElementById('services-overlay');
    el.classList.add('open');
    el.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }
  function closeServices(){
    document.getElementById('services-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }
  document.addEventListener('scroll', () => {
    const label = document.getElementById('top-right-label');
    if (window.scrollY > 80) {
      label.style.opacity = '0';
      label.style.transform = 'translateY(-12px)';
    } else {
      label.style.opacity = '1';
      label.style.transform = 'translateY(0)';
    }
  });


