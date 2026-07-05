// ww-elements.jsx — shared Wild-West visual primitives, built on animations.jsx
// Exposes: Sky, Stars, SunGlow, Skyline, Lantern, DustField, Tumbleweed,
//          BirdFlock, Stagecoach, Vignette, LogoTitle, PALETTE
(function () {
  const { useTime, Easing } = window;

  const PALETTE = {
    nightTop: '#150d07',
    duskMid: '#3e2416',
    horizon: '#a5713f',
    horizonBright: '#e8c99a',
    silhouette: '#140d09',
    silhouette2: '#241708',
    tan: '#e8c99a',
    tanDim: 'rgba(232,201,154,0.55)',
    lantern: '#f2a65a',
    dust: 'rgba(201,162,106,0.5)',
  };

  function Sky({ colors }) {
    return React.createElement('div', {
      style: {
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, ${colors.join(', ')})`,
      },
    });
  }

  function Stars({ count = 40, area, opacity = 1 }) {
    const t = useTime();
    const stars = React.useMemo(() => (
      Array.from({ length: count }, (_, i) => ({
        x: (i * 137.5) % area.w,
        y: (i * 71.3) % area.h,
        phase: (i * 0.62) % (Math.PI * 2),
        size: 1 + (i % 3),
      }))
    ), [count, area.w, area.h]);
    return React.createElement('div', { style: { position: 'absolute', inset: 0, opacity } },
      stars.map((s, i) => {
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.8 + s.phase));
        return React.createElement('div', {
          key: i,
          style: {
            position: 'absolute', left: s.x, top: s.y,
            width: s.size, height: s.size, borderRadius: '50%',
            background: PALETTE.tan, opacity: twinkle * 0.85,
          },
        });
      })
    );
  }

  function SunGlow({ x, y, size = 220, color = PALETTE.lantern, coreColor = '#f7dcae' }) {
    return React.createElement('div', {
      style: {
        position: 'absolute', left: x - size / 2, top: y - size / 2,
        width: size, height: size, borderRadius: '50%',
        background: `radial-gradient(circle, ${coreColor} 0%, ${color} 40%, rgba(0,0,0,0) 72%)`,
        filter: 'blur(1px)',
      },
    });
  }

  // Warm lit windows scattered on a building face
  function windowsFor(b, groundY, t) {
    const w = b.width, h = b.height;
    if (w < 40 || h < 45) return null;
    const cols = Math.max(1, Math.round(w / 34));
    const rows = Math.max(1, Math.round(h / 46));
    const cw = Math.min(14, w / (cols * 1.9));
    const ch = Math.min(18, h / (rows * 2.1));
    const cells = [];
    let k = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seed = (b.x * 13 + r * 71 + c * 37) % 100;
        if (seed < 26) { k++; continue; } // some dark windows
        const gx = b.x + (c + 0.5) * (w / cols) - cw / 2;
        const gy = groundY - h + 14 + r * (h - 22) / Math.max(1, rows) ;
        const flick = 0.6 + 0.4 * Math.abs(Math.sin(t * (1.4 + (seed % 5) * 0.3) + seed));
        const on = seed % 11 !== 0; // a few flicker off
        cells.push(React.createElement('div', {
          key: `win-${b.x}-${k}`,
          style: {
            position: 'absolute', left: gx, top: gy, width: cw, height: ch, borderRadius: 1,
            background: '#f2b866', opacity: on ? 0.5 + 0.5 * flick : 0.12,
            boxShadow: on ? `0 0 ${7 * flick}px rgba(242,166,90,${0.7 * flick})` : 'none',
          },
        }));
        k++;
      }
    }
    return cells;
  }

  // buildings: [{x, width, height, roof:'flat'|'peak'|'tower', accent:bool}]
  function Skyline({ groundY, buildings, color = PALETTE.silhouette, scale = 1, lit = false }) {
    const t = useTime();
    return React.createElement('div', { style: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' } },
      buildings.map((b, i) => {
        const w = b.width * scale, h = b.height * scale;
        const base = React.createElement('div', {
          key: `base-${i}`,
          style: {
            position: 'absolute', left: b.x, top: groundY - h, width: w, height: h,
            background: color,
          },
        });
        const extras = [];
        if (b.roof === 'peak') {
          extras.push(React.createElement('div', {
            key: `roof-${i}`,
            style: {
              position: 'absolute', left: b.x - w * 0.08, top: groundY - h - w * 0.32,
              width: w * 1.16, height: w * 0.36,
              background: color,
              clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)',
            },
          }));
        } else if (b.roof === 'flat') {
          extras.push(React.createElement('div', {
            key: `parapet-${i}`,
            style: {
              position: 'absolute', left: b.x + w * 0.28, top: groundY - h - w * 0.14,
              width: w * 0.44, height: w * 0.18,
              background: color,
            },
          }));
        } else if (b.roof === 'tower') {
          extras.push(React.createElement('div', {
            key: `cap-${i}`,
            style: {
              position: 'absolute', left: b.x - w * 0.25, top: groundY - h - w * 0.25,
              width: w * 1.5, height: w * 0.3,
              background: color,
            },
          }));
        }
        return React.createElement(React.Fragment, { key: i }, base, ...extras);
      }),
      lit ? buildings.map((b, i) => React.createElement('div', { key: `wins-${i}`, style: { position: 'absolute', inset: 0 } }, windowsFor(b, groundY, t))) : null
    );
  }

  function Lantern({ x, y, size = 10, glow = 46, phase = 0 }) {
    const t = useTime();
    const flicker = 0.72 + 0.28 * Math.abs(Math.sin(t * 3.1 + phase) * Math.sin(t * 1.3 + phase * 2));
    return React.createElement('div', { style: { position: 'absolute', left: x, top: y } },
      React.createElement('div', {
        style: {
          position: 'absolute', left: -glow / 2, top: -glow / 2, width: glow, height: glow,
          borderRadius: '50%', background: `radial-gradient(circle, rgba(242,166,90,${0.55 * flicker}) 0%, rgba(242,166,90,0) 70%)`,
        },
      }),
      React.createElement('div', {
        style: {
          position: 'absolute', left: -size / 2, top: -size / 2, width: size, height: size,
          borderRadius: '50%', background: PALETTE.lantern, opacity: flicker,
          boxShadow: `0 0 ${6 * flicker}px ${PALETTE.lantern}`,
        },
      })
    );
  }

  function DustField({ count = 26, area, color = PALETTE.dust, driftSpeed = 6, size = [1, 3], duration = 28 }) {
    const t = useTime();
    const wrapW = area.w + 40;
    const particles = React.useMemo(() => (
      Array.from({ length: count }, (_, i) => ({
        x0: (i * 53.7) % area.w,
        y0: area.y + (i * 37.1) % area.h,
        laps: 1 + (i % 3),          // whole horizontal laps per loop -> seamless
        vlaps: 1 + (i % 2),         // whole vertical bobs per loop
        amp: 10 + (i % 7) * 4,
        phase: (i * 0.9) % (Math.PI * 2),
        size: size[0] + (i % 3) * ((size[1] - size[0]) / 2),
      }))
    ), [count, area.w, area.h, area.y]);
    const cyc = ((t % duration) / duration);
    return React.createElement('div', { style: { position: 'absolute', inset: 0, overflow: 'hidden' } },
      particles.map((p, i) => {
        const x = (p.x0 + cyc * p.laps * wrapW) % wrapW - 20;
        const y = p.y0 + Math.sin(cyc * Math.PI * 2 * p.vlaps + p.phase) * p.amp;
        return React.createElement('div', {
          key: i,
          style: {
            position: 'absolute', left: x, top: y, width: p.size, height: p.size,
            borderRadius: '50%', background: color, opacity: 0.55,
          },
        });
      })
    );
  }

  function TumbleweedShape({ size = 34, color = PALETTE.silhouette }) {
    const lines = Array.from({ length: 7 }, (_, i) => i * (180 / 7));
    return React.createElement('div', { style: { position: 'relative', width: size, height: size } },
      lines.map((deg, i) => React.createElement('div', {
        key: i,
        style: {
          position: 'absolute', left: '50%', top: '50%', width: size * 1.05, height: 2,
          background: color, opacity: 0.8, borderRadius: 2,
          transform: `translate(-50%,-50%) rotate(${deg}deg)`,
        },
      })),
      React.createElement('div', {
        style: {
          position: 'absolute', left: '18%', top: '18%', width: '64%', height: '64%',
          borderRadius: '50%', border: `2px solid ${color}`, opacity: 0.7,
        },
      })
    );
  }

  function Tumbleweed({ groundY, size = 30, duration = 14, delay = 0, reverse = false, color }) {
    const t = useTime();
    const w = 1920;
    const local = ((t + delay) % duration) / duration;
    const p = reverse ? 1 - local : local;
    const x = -60 + p * (w + 120);
    const bounce = Math.abs(Math.sin(p * Math.PI * 9)) * (size * 0.35);
    const rot = p * 900 * (reverse ? -1 : 1);
    return React.createElement('div', {
      style: {
        position: 'absolute', left: x, top: groundY - size - bounce,
        transform: `rotate(${rot}deg)`,
      },
    }, React.createElement(TumbleweedShape, { size, color }));
  }

  function Bird({ x, y, size = 16, color = PALETTE.silhouette, phase = 0 }) {
    const t = useTime();
    const flap = Math.sin(t * 6 + phase);
    return React.createElement('div', { style: { position: 'absolute', left: x, top: y, width: size * 2, height: size } },
      [-1, 1].map((side) => React.createElement('div', {
        key: side,
        style: {
          position: 'absolute', left: size, top: size * 0.5, width: size, height: 2.5,
          background: color, transformOrigin: side < 0 ? 'right center' : 'left center',
          transform: `rotate(${side * (28 + flap * 16)}deg)`, borderRadius: 2,
        },
      }))
    );
  }

  function BirdFlock({ birds, duration = 18 }) {
    const t = useTime();
    return React.createElement('div', { style: { position: 'absolute', inset: 0 } },
      birds.map((b, i) => {
        const local = ((t + b.delay) % duration) / duration;
        const x = b.x0 + local * b.dx;
        const y = b.y0 + Math.sin(local * Math.PI * 2 + i) * b.wob;
        return React.createElement(Bird, { key: i, x, y, size: b.size, color: b.color, phase: i });
      })
    );
  }

  function Stagecoach({ y, size = 1, duration = 16, delay = 0, color = PALETTE.silhouette, dustColor = PALETTE.dust }) {
    const t = useTime();
    const w = 1920;
    const local = ((t + delay) % duration) / duration;
    const x = -260 * size + local * (w + 520 * size);
    const wheelSpin = (t * 240) % 360;
    const bodyW = 130 * size, bodyH = 62 * size;
    return React.createElement('div', { style: { position: 'absolute', left: x, top: y, width: bodyW + 40 * size, height: bodyH + 30 * size } },
      // dust trail
      Array.from({ length: 6 }).map((_, i) => React.createElement('div', {
        key: `d${i}`,
        style: {
          position: 'absolute', left: -20 * size - i * 16 * size, top: bodyH - 6 * size + Math.sin(t * 2 + i) * 4,
          width: 20 * size, height: 12 * size, borderRadius: '50%',
          background: dustColor, opacity: 0.4 - i * 0.05,
        },
      })),
      // body
      React.createElement('div', { style: { position: 'absolute', left: 30 * size, top: 6 * size, width: bodyW, height: bodyH * 0.62, background: color, borderRadius: 4 } }),
      React.createElement('div', { style: { position: 'absolute', left: 46 * size, top: 0, width: bodyW * 0.62, height: bodyH * 0.34, background: color, borderRadius: 3 } }),
      // wheels
      [0.32, 0.78].map((f, i) => React.createElement('div', {
        key: `w${i}`,
        style: {
          position: 'absolute', left: 30 * size + bodyW * f - 18 * size, top: bodyH * 0.62 + 2 * size,
          width: 36 * size, height: 36 * size, borderRadius: '50%',
          background: `conic-gradient(${color} 0 10deg, transparent 10deg 80deg, ${color} 80deg 90deg, transparent 90deg 170deg, ${color} 170deg 180deg, transparent 180deg 260deg, ${color} 260deg 270deg, transparent 270deg 350deg, ${color} 350deg 360deg)`,
          border: `3px solid ${color}`, boxSizing: 'border-box',
          transform: `rotate(${wheelSpin}deg)`,
        },
      }))
    );
  }

  function HorseLeg({ hx, hy, upper, lower, thick, color, phi, p }) {
    const theta = Math.PI * 2 * (phi + p);
    const upperAngle = 20 * Math.sin(theta);
    const kneeBend = 30 * (0.5 - 0.5 * Math.cos(theta));
    return React.createElement('div', {
      style: {
        position: 'absolute', left: hx, top: hy, width: thick, height: upper,
        transformOrigin: 'top center', transform: `translateX(-50%) rotate(${upperAngle}deg)`,
        background: color, borderRadius: thick,
      },
    },
      React.createElement('div', {
        style: {
          position: 'absolute', left: '50%', top: upper - 1, width: thick * 0.86, height: lower,
          transformOrigin: 'top center', transform: `translateX(-50%) rotate(${kneeBend}deg)`,
          background: color, borderRadius: thick,
        },
      },
        React.createElement('div', {
          style: { position: 'absolute', left: '50%', top: lower - 2, width: thick * 1.4, height: thick * 1.2, transform: 'translateX(-50%)', background: color, borderRadius: 2 },
        })
      )
    );
  }

  // Stylised galloping horse, facing right. Local box ~186x134.
  function Horse({ color = PALETTE.silhouette, darkColor = '#0d0805', phi = 0, phaseOffset = 0 }) {
    const bob = 3 * Math.sin(Math.PI * 2 * (phi + phaseOffset));
    const tailSway = 9 * Math.sin(Math.PI * 2 * (phi + phaseOffset) + 1);
    const legs = [
      { hx: 48, hy: 80, p: 0.00, far: false },   // near hind
      { hx: 120, hy: 82, p: 0.55, far: false },  // near front
      { hx: 42, hy: 78, p: 0.16, far: true },    // far hind
      { hx: 114, hy: 80, p: 0.66, far: true },   // far front
    ];
    return React.createElement('div', { style: { position: 'absolute', left: 0, top: bob, width: 186, height: 134 } },
      // far legs (behind body)
      legs.filter(l => l.far).map((l, i) => React.createElement(HorseLeg, {
        key: `fl${i}`, hx: l.hx, hy: l.hy, upper: 30, lower: 28, thick: 6, color: darkColor, phi, p: l.p,
      })),
      // tail
      React.createElement('div', {
        style: {
          position: 'absolute', left: 30, top: 54, width: 8, height: 52,
          transformOrigin: 'top center', transform: `rotate(${150 + tailSway}deg)`,
          background: darkColor, borderRadius: 6,
        },
      }),
      // hindquarter
      React.createElement('div', { style: { position: 'absolute', left: 28, top: 44, width: 48, height: 50, borderRadius: '50%', background: color } }),
      // barrel
      React.createElement('div', { style: { position: 'absolute', left: 48, top: 50, width: 84, height: 38, borderRadius: '46% 46% 42% 42%', background: color } }),
      // chest / shoulder
      React.createElement('div', { style: { position: 'absolute', left: 104, top: 52, width: 36, height: 40, borderRadius: '50%', background: color } }),
      // neck — tapered trapezoid rising forward
      React.createElement('div', {
        style: {
          position: 'absolute', left: 112, top: 20, width: 44, height: 44, background: color,
          clipPath: 'polygon(8% 100%, 52% 0%, 100% 8%, 62% 100%)',
        },
      }),
      // head — horizontal oval, muzzle to the right
      React.createElement('div', { style: { position: 'absolute', left: 138, top: 14, width: 44, height: 22, borderRadius: '46% 60% 60% 46%', background: color } }),
      // muzzle
      React.createElement('div', { style: { position: 'absolute', left: 170, top: 20, width: 14, height: 15, borderRadius: '30% 55% 55% 30%', background: color } }),
      // ear
      React.createElement('div', { style: { position: 'absolute', left: 146, top: 4, width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '4px solid transparent', borderBottom: `12px solid ${color}`, transform: 'rotate(14deg)' } }),
      // mane
      React.createElement('div', { style: { position: 'absolute', left: 126, top: 12, width: 8, height: 40, background: darkColor, borderRadius: 5, transform: 'rotate(24deg)', transformOrigin: 'bottom center' } }),
      // near legs (in front)
      legs.filter(l => !l.far).map((l, i) => React.createElement(HorseLeg, {
        key: `nl${i}`, hx: l.hx, hy: l.hy, upper: 31, lower: 29, thick: 7, color, phi, p: l.p,
      }))
    );
  }

  function DustPuff({ x, y, r, opacity, color }) {
    return React.createElement('div', {
      style: {
        position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2,
        borderRadius: '50%', background: color, opacity, filter: 'blur(2px)',
      },
    });
  }

  // Plain wooden wagon (buckboard) pulled by a two-horse team, trotting across screen.
  function CoachAndHorses({ groundY, size = 1, duration = 24, delay = 0, color = PALETTE.silhouette, darkColor = '#0d0805', dustColor = PALETTE.dust }) {
    const t = useTime();
    const local = ((t + delay) % duration) / duration;
    const screenX = -480 * size + local * (1920 + 960 * size);
    const top = groundY - 128 * size;
    const speedScale = 24 / duration; // wheel/gait scale with travel speed
    const wheelSpin = (t * 150 * speedScale) % 360;
    const phi = t * 1.15 * speedScale; // slower gait
    const dustPhase = (t * 3.2) % 1;
    const wood = '#241509', woodDark = '#160c05';

    return React.createElement('div', {
      style: { position: 'absolute', left: 0, top: 0, transform: `translate(${screenX}px, ${top}px) scale(${size})`, transformOrigin: 'top left', width: 440, height: 150 },
    },
      // rolling dust behind wheels
      Array.from({ length: 7 }).map((_, i) => {
        const life = (dustPhase + i / 7) % 1;
        return React.createElement(DustPuff, {
          key: `wd${i}`, x: 4 - life * 40, y: 124 - life * 26 + Math.sin(t * 2 + i) * 3,
          r: 8 + life * 24, opacity: (1 - life) * 0.3, color: dustColor,
        });
      }),
      // wagon — flatbed plank
      React.createElement('div', { style: { position: 'absolute', left: 18, top: 86, width: 120, height: 12, background: wood, borderRadius: 2 } }),
      // low side box with a couple of slats
      React.createElement('div', { style: { position: 'absolute', left: 18, top: 70, width: 120, height: 18, background: wood } }),
      React.createElement('div', { style: { position: 'absolute', left: 18, top: 70, width: 120, height: 3, background: woodDark } }),
      React.createElement('div', { style: { position: 'absolute', left: 58, top: 70, width: 3, height: 18, background: woodDark } }),
      React.createElement('div', { style: { position: 'absolute', left: 98, top: 70, width: 3, height: 18, background: woodDark } }),
      // crate + barrel load
      React.createElement('div', { style: { position: 'absolute', left: 40, top: 50, width: 30, height: 22, background: wood, borderRadius: 2 } }),
      React.createElement('div', { style: { position: 'absolute', left: 40, top: 60, width: 30, height: 3, background: woodDark } }),
      React.createElement('div', { style: { position: 'absolute', left: 74, top: 52, width: 20, height: 20, borderRadius: '8px 8px 6px 6px', background: wood } }),
      // driver seat mounted on the box front
      React.createElement('div', { key: 'seat', style: { position: 'absolute', left: 106, top: 62, width: 34, height: 7, background: wood, borderRadius: 2 } }),
      React.createElement('div', { style: { position: 'absolute', left: 116, top: 66, width: 6, height: 6, background: wood } }), // seat support to box
      React.createElement('div', { style: { position: 'absolute', left: 106, top: 46, width: 6, height: 18, background: wood, borderRadius: 2 } }), // backrest
      // driver (silhouette, facing right)
      React.createElement('div', { style: { position: 'absolute', left: 115, top: 40, width: 14, height: 24, background: darkColor, borderRadius: '6px 6px 3px 3px', transform: 'rotate(6deg)', transformOrigin: 'bottom center' } }), // torso
      React.createElement('div', { style: { position: 'absolute', left: 128, top: 50, width: 16, height: 4, background: darkColor, borderRadius: 2, transform: 'rotate(14deg)', transformOrigin: 'left center' } }), // arm to reins
      React.createElement('div', { style: { position: 'absolute', left: 118, top: 29, width: 12, height: 12, background: darkColor, borderRadius: '50%' } }), // head
      React.createElement('div', { style: { position: 'absolute', left: 112, top: 29, width: 25, height: 3, background: darkColor, borderRadius: 2 } }), // hat brim
      React.createElement('div', { style: { position: 'absolute', left: 119, top: 21, width: 11, height: 9, background: darkColor, borderRadius: '4px 4px 1px 1px' } }), // hat crown
      // wagon wheels — big spoked
      [40, 118].map((wx, i) => React.createElement('div', {
        key: `ww${i}`,
        style: {
          position: 'absolute', left: wx - 25, top: 84, width: 50, height: 50, borderRadius: '50%',
          background: `conic-gradient(${wood} 0 7deg, transparent 7deg 83deg, ${wood} 83deg 90deg, transparent 90deg 173deg, ${wood} 173deg 180deg, transparent 180deg 263deg, ${wood} 263deg 270deg, transparent 270deg 353deg, ${wood} 353deg 360deg)`,
          border: `5px solid ${wood}`, boxSizing: 'border-box', transform: `rotate(${wheelSpin}deg)`,
        },
      })),
      // wagon tongue + reins to horses
      React.createElement('div', { style: { position: 'absolute', left: 138, top: 92, width: 80, height: 4, background: woodDark, transformOrigin: 'left center', transform: 'rotate(4deg)', borderRadius: 2 } }),
      React.createElement('div', { style: { position: 'absolute', left: 140, top: 60, width: 104, height: 2, background: darkColor, transformOrigin: 'left center', transform: 'rotate(9deg)', opacity: 0.75 } }),
      // far horse
      React.createElement('div', { style: { position: 'absolute', left: 190, top: -8 } }, React.createElement(Horse, { color: darkColor, darkColor: '#080503', phi, phaseOffset: 0.12 })),
      // hoof dust
      Array.from({ length: 5 }).map((_, i) => {
        const life = ((dustPhase + i / 5) % 1);
        return React.createElement(DustPuff, { key: `hd${i}`, x: 232 - life * 26, y: 128 + Math.sin(t * 3 + i) * 2, r: 5 + life * 11, opacity: (1 - life) * 0.2, color: dustColor });
      }),
      // near horse
      React.createElement('div', { style: { position: 'absolute', left: 220, top: 2 } }, React.createElement(Horse, { color, darkColor, phi, phaseOffset: 0 }))
    );
  }

  // ---- Wild-West storefront town ----
  function litWin(x, y, w, h, t, seed) {
    const flick = 0.72 + 0.28 * Math.abs(Math.sin(t * (1.3 + (seed % 4) * 0.4) + seed));
    return React.createElement('div', {
      key: `lw-${x}-${y}`,
      style: {
        position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 2,
        background: '#f2b866', opacity: 0.55 + 0.45 * flick,
        boxShadow: `0 0 ${8 * flick}px rgba(242,166,90,${0.6 * flick})`,
      },
    });
  }

  function Storefront({ x, w, h, groundY, type, wood, t, seed }) {
    const els = [];
    const topY = groundY - h;
    // body
    els.push(React.createElement('div', { key: 'body', style: { position: 'absolute', left: x, top: topY, width: w, height: h, background: wood } }));
    // roof / false front
    if (type === 'false') {
      els.push(React.createElement('div', { key: 'ff', style: { position: 'absolute', left: x - 4, top: topY - 26, width: w + 8, height: 30, background: wood } }));
      els.push(React.createElement('div', { key: 'cor', style: { position: 'absolute', left: x - 4, top: topY - 4, width: w + 8, height: 6, background: '#0f0904' } }));
    } else {
      els.push(React.createElement('div', { key: 'gable', style: { position: 'absolute', left: x - w * 0.06, top: topY - w * 0.28, width: w * 1.12, height: w * 0.3, background: wood, clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' } }));
    }
    // porch overhang + posts
    els.push(React.createElement('div', { key: 'porch', style: { position: 'absolute', left: x - 8, top: groundY - 46, width: w + 16, height: 8, background: '#0f0904' } }));
    els.push(React.createElement('div', { key: 'p1', style: { position: 'absolute', left: x + 6, top: groundY - 46, width: 4, height: 46, background: '#0f0904' } }));
    els.push(React.createElement('div', { key: 'p2', style: { position: 'absolute', left: x + w - 10, top: groundY - 46, width: 4, height: 46, background: '#0f0904' } }));
    // door (lit)
    els.push(litWin(x + w / 2 - 9, groundY - 44, 18, 34, t, seed + 3));
    // windows (lit)
    els.push(litWin(x + w * 0.16, topY + 20, Math.min(22, w * 0.18), 20, t, seed));
    if (w > 130) els.push(litWin(x + w * 0.64, topY + 20, Math.min(22, w * 0.18), 20, t, seed + 1));
    return React.createElement(React.Fragment, null, ...els);
  }

  function Saloon({ x, w, h, groundY, wood, t }) {
    const topY = groundY - h;
    const els = [];
    els.push(React.createElement('div', { key: 'body', style: { position: 'absolute', left: x, top: topY, width: w, height: h, background: wood } }));
    // two-storey false front
    els.push(React.createElement('div', { key: 'ff', style: { position: 'absolute', left: x - 6, top: topY - 40, width: w + 12, height: 44, background: wood } }));
    els.push(React.createElement('div', { key: 'cor', style: { position: 'absolute', left: x - 6, top: topY - 4, width: w + 12, height: 7, background: '#0f0904' } }));
    // sign board on the false front
    els.push(React.createElement('div', {
      key: 'sign',
      style: {
        position: 'absolute', left: x + w / 2 - 96, top: topY - 34, width: 192, height: 34,
        background: 'linear-gradient(180deg,#6b4426,#4a3016)', border: '3px solid #2a1c0e', borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Rye', serif", fontSize: 24, color: '#f0d6a6', letterSpacing: 3,
        boxShadow: '0 0 14px rgba(242,166,90,0.25)',
      },
    }, 'TAVERN'));
    // balcony rail
    els.push(React.createElement('div', { key: 'bal', style: { position: 'absolute', left: x, top: topY + h * 0.46, width: w, height: 5, background: '#0f0904' } }));
    Array.from({ length: Math.round(w / 24) }).forEach((_, i) => {
      els.push(React.createElement('div', { key: `bl${i}`, style: { position: 'absolute', left: x + 10 + i * 24, top: topY + h * 0.46, width: 3, height: 16, background: '#0f0904' } }));
    });
    // upstairs windows
    Array.from({ length: 3 }).forEach((_, i) => {
      els.push(litWin(x + w * (0.16 + i * 0.28), topY + 16, 26, 26, t, i * 5 + 2));
    });
    // porch overhang + posts
    els.push(React.createElement('div', { key: 'porch', style: { position: 'absolute', left: x - 10, top: groundY - 58, width: w + 20, height: 10, background: '#0f0904' } }));
    [x + 8, x + w * 0.5 - 2, x + w - 12].forEach((px, i) => {
      els.push(React.createElement('div', { key: `sp${i}`, style: { position: 'absolute', left: px, top: groundY - 58, width: 5, height: 58, background: '#0f0904' } }));
    });
    // double batwing doors (lit)
    els.push(litWin(x + w / 2 - 26, groundY - 52, 24, 44, t, 7));
    els.push(litWin(x + w / 2 + 2, groundY - 52, 24, 44, t, 9));
    // lanterns flanking door
    els.push(React.createElement(Lantern, { key: 'lanL', x: x + w / 2 - 40, y: groundY - 60, phase: 0.5, glow: 42 }));
    els.push(React.createElement(Lantern, { key: 'lanR', x: x + w / 2 + 40, y: groundY - 60, phase: 2.2, glow: 42 }));
    return React.createElement(React.Fragment, null, ...els);
  }

  var TOWN_SHOPS = [
    { x: 300, w: 150, h: 150, type: 'false', seed: 1 },
    { x: 470, w: 120, h: 128, type: 'gable', seed: 2 },
    { x: 606, w: 120, h: 140, type: 'false', seed: 3 },
    { x: 1058, w: 140, h: 158, type: 'false', seed: 4 },
    { x: 1214, w: 150, h: 132, type: 'gable', seed: 5 },
    { x: 1380, w: 150, h: 150, type: 'false', seed: 6 },
    { x: 1546, w: 110, h: 126, type: 'gable', seed: 7 },
  ];
  var TOWN_SALOON = { x: 760, w: 280, h: 216 };

  function WesternTown({ groundY, wood = '#1c1109' }) {
    const t = useTime();
    return React.createElement('div', { style: { position: 'absolute', inset: 0 } },
      TOWN_SHOPS.map((s, i) => React.createElement(Storefront, { key: i, ...s, groundY, wood, t })),
      React.createElement(Saloon, { x: TOWN_SALOON.x, w: TOWN_SALOON.w, h: TOWN_SALOON.h, groundY, wood, t })
    );
  }

  // Long backlit shadows cast forward onto the road; gently shimmer (heat-haze),
  // fully periodic with the loop.
  function BuildingShadows({ groundY, loop = 28, sunX = 980, color = 'rgba(10,6,3,0.42)' }) {
    const t = useTime();
    const cyc = (t % loop) / loop;
    const all = TOWN_SHOPS.concat([TOWN_SALOON]);
    return React.createElement('div', { style: { position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' } },
      all.map((b, i) => {
        const cx = b.x + b.w / 2;
        const lean = ((cx - sunX) / sunX) * 24;              // fan away from the sun
        const shimmer = Math.sin(cyc * Math.PI * 2 * 2 + i * 1.3) * 2.4
                      + Math.sin(cyc * Math.PI * 2 * 5 + i * 0.7) * 1.5; // finer ripple, whole cycles
        const pulse = 0.84 + 0.16 * Math.sin(cyc * Math.PI * 2 * 3 + i);
        const len = 150 + b.h * 0.7;
        return React.createElement('div', {
          key: i,
          style: {
            position: 'absolute', left: b.x + 4, top: groundY - 4, width: b.w - 8, height: len,
            background: `linear-gradient(180deg, ${color} 0%, rgba(10,6,3,0.18) 55%, rgba(10,6,3,0) 100%)`,
            transformOrigin: 'top center',
            transform: `skewX(${lean + shimmer}deg) scaleY(1)`,
            filter: 'blur(4px)', opacity: pulse, borderRadius: '0 0 40% 40%',
          },
        });
      })
    );
  }

  function Vignette({ strength = 0.55 }) {
    return React.createElement('div', {
      style: {
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 45%, rgba(10,6,3,${strength}) 100%)`,
      },
    });
  }

  function LogoTitle({ x, y, title = 'WILD WEST RP', subtitle = 'OUTRUN GAMES', align = 'center', scale = 1 }) {
    return React.createElement('div', {
      style: {
        position: 'absolute', left: x, top: y,
        transform: align === 'center' ? 'translate(-50%,-50%)' : (align === 'left' ? 'translate(0,-50%)' : 'translate(-100%,-50%)'),
        textAlign: align === 'center' ? 'center' : align,
        display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : (align === 'left' ? 'flex-start' : 'flex-end'),
        gap: 6 * scale,
      },
    },
      React.createElement('div', {
        style: {
          fontFamily: "'Rye', serif", fontSize: 76 * scale, color: PALETTE.tan, letterSpacing: 2,
          textShadow: '0 2px 0 rgba(0,0,0,0.5), 0 0 30px rgba(242,166,90,0.35)',
          lineHeight: 1,
        },
      }, title),
      React.createElement('div', {
        style: {
          fontFamily: "'Special Elite', monospace", fontSize: 17 * scale, color: PALETTE.tanDim,
          letterSpacing: 5, textTransform: 'uppercase',
        },
      }, subtitle)
    );
  }

  window.PALETTE = PALETTE;
  window.Sky = Sky;
  window.Stars = Stars;
  window.SunGlow = SunGlow;
  window.Skyline = Skyline;
  window.Lantern = Lantern;
  window.DustField = DustField;
  window.Tumbleweed = Tumbleweed;
  window.BirdFlock = BirdFlock;
  window.Stagecoach = Stagecoach;
  window.CoachAndHorses = CoachAndHorses;
  window.Horse = Horse;
  window.Vignette = Vignette;
  window.WesternTown = WesternTown;
  window.BuildingShadows = BuildingShadows;
  window.LogoTitle = LogoTitle;
})();
