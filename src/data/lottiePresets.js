function staticProp(k) {
  return { a: 0, k };
}

function linearAnim(from, to, duration = 360) {
  return {
    a: 1,
    k: [
      {
        t: 0,
        s: Array.isArray(from) ? from : [from],
        i: { x: [0.5], y: [0.5] },
        o: { x: [0.5], y: [0.5] },
      },
      {
        t: duration,
        s: Array.isArray(to) ? to : [to],
      },
    ],
  };
}

function pulseAnim(minVal, maxVal, duration = 240) {
  return {
    a: 1,
    k: [
      {
        t: 0,
        s: Array.isArray(minVal) ? minVal : [minVal],
        i: { x: [0.42], y: [1] },
        o: { x: [0.58], y: [0] },
      },
      {
        t: duration / 2,
        s: Array.isArray(maxVal) ? maxVal : [maxVal],
        i: { x: [0.42], y: [1] },
        o: { x: [0.58], y: [0] },
      },
      {
        t: duration,
        s: Array.isArray(minVal) ? minVal : [minVal],
      },
    ],
  };
}

function baseTransform(rotation = staticProp(0), position = staticProp([960, 540, 0]), opacity = staticProp(100), scale = staticProp([100, 100, 100])) {
  return {
    o: opacity,
    r: rotation,
    p: position,
    a: staticProp([0, 0, 0]),
    s: scale,
  };
}

function groupTransform(position = [0, 0], rotation = 0) {
  return {
    ty: 'tr',
    p: staticProp(position),
    a: staticProp([0, 0]),
    s: staticProp([100, 100]),
    r: staticProp(rotation),
    o: staticProp(100),
  };
}

function strokeShape(rgba, width = 1.5, dash = null) {
  const shape = {
    ty: 'st',
    c: staticProp(rgba),
    o: staticProp(100),
    w: staticProp(width),
    lc: 2,
    lj: 2,
  };
  if (dash) {
    shape.d = dash;
  }
  return shape;
}

const orbitalData = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 360,
  w: 1920,
  h: 1080,
  nm: 'Orbital Rings',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Outer Ring',
      sr: 1,
      ks: baseTransform(linearAnim(0, 360, 360)),
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'el', p: staticProp([0, 0]), s: staticProp([920, 920]) },
            strokeShape([1, 1, 1, 0.25], 1.5, [
              { n: 'd', nm: 'dash', v: staticProp(14) },
              { n: 'g', nm: 'gap', v: staticProp(18) },
              { n: 'o', nm: 'offset', v: staticProp(0) },
            ]),
            groupTransform(),
          ],
        },
        {
          ty: 'gr',
          it: [
            { ty: 'el', p: staticProp([460, 0]), s: staticProp([12, 12]) },
            { ty: 'fl', c: staticProp([1, 0.302, 0, 1]), o: staticProp(100) },
            groupTransform(),
          ],
        },
      ],
      ip: 0,
      op: 360,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Mid Ring',
      sr: 1,
      ks: baseTransform(linearAnim(360, 0, 360)),
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'el', p: staticProp([0, 0]), s: staticProp([640, 640]) },
            strokeShape([0.85, 0.85, 0.9, 0.35], 1.25, [
              { n: 'd', nm: 'dash', v: staticProp(180) },
              { n: 'g', nm: 'gap', v: staticProp(120) },
              { n: 'o', nm: 'offset', v: staticProp(0) },
            ]),
            groupTransform(),
          ],
        },
      ],
      ip: 0,
      op: 360,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Inner Pulse',
      sr: 1,
      ks: baseTransform(staticProp(0), staticProp([960, 540, 0]), pulseAnim(25, 70, 360), pulseAnim([95, 95, 100], [105, 105, 100], 360)),
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'el', p: staticProp([0, 0]), s: staticProp([360, 360]) },
            strokeShape([1, 1, 1, 0.35], 1),
            groupTransform(),
          ],
        },
      ],
      ip: 0,
      op: 360,
      st: 0,
      bm: 0,
    },
  ],
};

const apertureData = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 360,
  w: 1920,
  h: 1080,
  nm: 'Cinema Aperture',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Octagon Frame',
      sr: 1,
      ks: baseTransform(linearAnim(0, 180, 360), staticProp([960, 540, 0]), staticProp(75)),
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'sr',
              sy: 2,
              pt: staticProp(8),
              p: staticProp([0, 0]),
              r: staticProp(0),
              or: staticProp(420),
              os: staticProp(0),
            },
            strokeShape([1, 1, 1, 0.3], 1.5),
            groupTransform(),
          ],
        },
      ],
      ip: 0,
      op: 360,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Inner Blade',
      sr: 1,
      ks: baseTransform(linearAnim(180, 0, 360), staticProp([960, 540, 0]), pulseAnim(30, 80, 360), pulseAnim([86, 86, 100], [108, 108, 100], 360)),
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'sr',
              sy: 2,
              pt: staticProp(6),
              p: staticProp([0, 0]),
              r: staticProp(30),
              or: staticProp(250),
              os: staticProp(0),
            },
            strokeShape([1, 0.302, 0, 0.8], 1.5),
            groupTransform(),
          ],
        },
      ],
      ip: 0,
      op: 360,
      st: 0,
      bm: 0,
    },
  ],
};

const gridPulseData = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 240,
  w: 1920,
  h: 1080,
  nm: 'Architectural Nodes',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Grid Boxes',
      sr: 1,
      ks: baseTransform(staticProp(0), staticProp([960, 540, 0]), pulseAnim(25, 65, 240)),
      ao: 0,
      shapes: [
        ...[
          [-480, -240],
          [0, -240],
          [480, -240],
          [-480, 0],
          [480, 0],
          [-480, 240],
          [0, 240],
          [480, 240],
        ].map(([x, y]) => ({
          ty: 'gr',
          it: [
            { ty: 'rc', p: staticProp([x, y]), s: staticProp([180, 180]), r: staticProp(12) },
            strokeShape([1, 1, 1, 0.25], 1.2),
            groupTransform(),
          ],
        })),
      ],
      ip: 0,
      op: 240,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Center Core',
      sr: 1,
      ks: baseTransform(linearAnim(0, 90, 240), staticProp([960, 540, 0]), pulseAnim(40, 90, 240), pulseAnim([90, 90, 100], [110, 110, 100], 240)),
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', p: staticProp([0, 0]), s: staticProp([180, 180]), r: staticProp(12) },
            strokeShape([1, 0.302, 0, 0.85], 1.75),
            groupTransform(),
          ],
        },
      ],
      ip: 0,
      op: 240,
      st: 0,
      bm: 0,
    },
  ],
};

const horizonData = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 240,
  w: 1920,
  h: 1080,
  nm: 'Kinetic Horizon',
  ddd: 0,
  assets: [],
  layers: [
    ...[0, 1, 2, 3, 4].map((idx) => {
      const yOffset = (idx - 2) * 140;
      const startX = idx % 2 === 0 ? 780 : 1140;
      const endX = idx % 2 === 0 ? 1140 : 780;
      return {
        ddd: 0,
        ind: idx + 1,
        ty: 4,
        nm: `Line ${idx + 1}`,
        sr: 1,
        ks: baseTransform(
          staticProp(0),
          pulseAnim([startX, 540 + yOffset, 0], [endX, 540 + yOffset, 0], 240),
          staticProp(idx === 2 ? 85 : 40)
        ),
        ao: 0,
        shapes: [
          {
            ty: 'gr',
            it: [
              { ty: 'rc', p: staticProp([0, 0]), s: staticProp([960, 1.5]), r: staticProp(0) },
              {
                ty: 'fl',
                c: staticProp(idx === 2 ? [1, 0.302, 0, 0.9] : [1, 1, 1, 0.5]),
                o: staticProp(100),
              },
              groupTransform(),
            ],
          },
        ],
        ip: 0,
        op: 240,
        st: 0,
        bm: 0,
      };
    }),
  ],
};

export const LOTTIE_PRESETS = {
  orbital: {
    id: 'orbital',
    name: 'Orbital Rings',
    description: 'Minimalist concentric telemetry rings with subtle accent satellite.',
    data: orbitalData,
  },
  aperture: {
    id: 'aperture',
    name: 'Cinema Aperture',
    description: 'Counter-rotating geometric lens blades.',
    data: apertureData,
  },
  gridPulse: {
    id: 'gridPulse',
    name: 'Architectural Grid',
    description: 'Calm breathing grid nodes with a rotating core square.',
    data: gridPulseData,
  },
  horizon: {
    id: 'horizon',
    name: 'Kinetic Horizon',
    description: 'Drifting horizontal scan lines with accent center guide.',
    data: horizonData,
  },
};
