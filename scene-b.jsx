// scene-b.jsx — "Desert Skyline Sunset" (detailed)
(function () {
  const { Stage, useTime } = window;
  const { PALETTE, Sky, SunGlow, Skyline, Lantern, DustField, Tumbleweed, BirdFlock, CoachAndHorses, WesternTown, BuildingShadows, Vignette, LogoTitle } = window;

  const W = 1920, H = 1080, GROUND = 872, LOOP = 28;

  function town() {
    const b = [];
    let x = 470;
    const pattern = [
      { w: 108, h: 132, roof: 'flat' },
      { w: 150, h: 176, roof: 'peak' },
      { w: 60, h: 210, roof: 'tower' },
      { w: 124, h: 120, roof: 'flat' },
      { w: 158, h: 158, roof: 'peak' },
      { w: 96, h: 112, roof: 'flat' },
      { w: 140, h: 150, roof: 'flat' },
      { w: 120, h: 190, roof: 'peak' },
    ];
    let i = 0;
    while (x < 1430) {
      const p = pattern[i % pattern.length];
      b.push({ x, width: p.w, height: p.h, roof: p.roof });
      x += p.w + 12;
      i++;
    }
    return b;
  }

  // distant mesa / butte silhouettes
  function Mesa({ x, y, w, h, color }) {
    return React.createElement('div', {
      style: {
        position: 'absolute', left: x, top: y, width: w, height: h,
        background: color, clipPath: 'polygon(6% 100%, 0 22%, 14% 22%, 20% 0, 80% 0, 86% 22%, 100% 22%, 94% 100%)',
      },
    });
  }

  function SunRays({ x, y, count = 14 }) {
    const t = useTime();
    const rot = (t / LOOP) * 360 % 360; // exactly one turn per loop -> seamless
    return React.createElement('div', {
      style: {
        position: 'absolute', left: x, top: y, width: 0, height: 0,
        transform: `rotate(${rot}deg)`, opacity: 0.16,
      },
    },
      Array.from({ length: count }).map((_, i) => React.createElement('div', {
        key: i,
        style: {
          position: 'absolute', left: -3, top: 0, width: 6, height: 620,
          background: 'linear-gradient(180deg, rgba(255,224,170,0.9), rgba(255,224,170,0))',
          transformOrigin: 'top center', transform: `rotate(${(360 / count) * i}deg)`,
        },
      }))
    );
  }

  function HeatHaze() {
    const t = useTime();
    const shift = Math.sin((t / LOOP) * Math.PI * 4) * 6; // whole cycles per loop
    return React.createElement('div', {
      style: {
        position: 'absolute', left: 0, top: GROUND - 130, width: W, height: 150,
        background: `linear-gradient(180deg, rgba(242,166,90,0) 0%, rgba(242,166,90,0.10) 60%, rgba(242,166,90,0.02) 100%)`,
        transform: `translateX(${shift}px)`,
      },
    });
  }

  function SceneB() {
    const buildings = React.useMemo(town, []);
    // birds: delay 0 + staggered start x so every bird is OFF-SCREEN at the loop
    // boundary (t=0 and t=LOOP) -> no visible teleport when the stage loops.
    const birds = React.useMemo(() => ([
      { x0: -120, y0: 210, dx: W + 320, wob: 22, size: 13, color: PALETTE.silhouette, delay: 0 },
      { x0: -1100, y0: 270, dx: W + 1300, wob: 16, size: 11, color: PALETTE.silhouette, delay: 0 },
      { x0: -2050, y0: 175, dx: W + 2250, wob: 12, size: 9, color: PALETTE.silhouette, delay: 0 },
    ]), []);

    return React.createElement(Stage, { width: W, height: H, duration: LOOP, background: PALETTE.nightTop, loop: true, autoplay: true },
      React.createElement(Sky, { colors: ['#140c06 8%', '#3a2013 38%', '#7a4a28 66%', '#c9803f 82%', '#f4d19a 93%', '#fbe8c4'] }),
      React.createElement(SunRays, { x: 980, y: 730, count: 16 }),
      React.createElement(SunGlow, { x: 980, y: 740, size: 300, color: '#f2a65a', coreColor: '#fff3d9' }),
      React.createElement(SunGlow, { x: 980, y: 740, size: 620, color: 'rgba(242,166,90,0.35)', coreColor: 'rgba(255,220,160,0.5)' }),
      React.createElement(BirdFlock, { birds, duration: LOOP }),
      // distant mesas
      React.createElement(Mesa, { x: 120, y: GROUND - 260, w: 360, h: 260, color: 'rgba(74,42,24,0.5)' }),
      React.createElement(Mesa, { x: 1380, y: GROUND - 320, w: 440, h: 320, color: 'rgba(74,42,24,0.55)' }),
      React.createElement(Mesa, { x: 1560, y: GROUND - 210, w: 300, h: 210, color: 'rgba(58,32,19,0.6)' }),
      React.createElement(HeatHaze, null),
      // Wild-West storefront town with central saloon
      React.createElement(WesternTown, { groundY: GROUND, wood: '#1c1109' }),
      // ground — sunlit dusty road for silhouette contrast
      React.createElement('div', {
        style: { position: 'absolute', left: 0, top: GROUND, width: W, height: H - GROUND, background: 'linear-gradient(180deg,#9a6531 0%,#7c4f27 54%,#48301a 100%)' },
      }),
      React.createElement('div', {
        style: { position: 'absolute', left: 0, top: GROUND, width: W, height: 5, background: 'rgba(255,214,150,0.5)' },
      }),
      // shimmering backlit shadows on the road (looped)
      React.createElement(BuildingShadows, { groundY: GROUND, loop: LOOP, sunX: 980 }),
      // wooden wagon + horse team — period == stage loop, off-screen at the
      // boundary, so the loop is seamless (no teleport).
      React.createElement(CoachAndHorses, { groundY: GROUND + 100, size: 1.15, duration: LOOP, delay: 0, color: '#150d07', darkColor: '#090604' }),
      React.createElement(DustField, { count: 26, area: { w: W, h: 150, y: GROUND - 20 }, driftSpeed: 20, duration: LOOP }),
      React.createElement(Tumbleweed, { groundY: GROUND + 210, size: 56, duration: LOOP / 2, delay: 0, color: '#0e0805' }),
      // soft foreground darkening for grounding (vignette-style)
      React.createElement('div', {
        style: { position: 'absolute', left: 0, bottom: 0, width: W, height: 170, background: 'linear-gradient(180deg, rgba(16,10,6,0) 0%, rgba(8,5,3,0.72) 100%)' },
      }),
      React.createElement(LogoTitle, { x: W / 2, y: 250, title: 'WILD WEST RP', subtitle: 'OUTRUN GAMES', align: 'center', scale: 1.15 }),
      React.createElement(Vignette, { strength: 0.58 })
    );
  }

  window.SceneB = SceneB;
})();
