export const portfolioData = {
  personal: {
    name: "Marco",
    displayName: "Marco", // Replace with your full name
    headline: "Vibe Coder, Creative Technologist & Multidisciplinary Artist",
    subheadline: "Applied Science undergraduate at Wayamba University of Sri Lanka (WUSL). Building practical software solutions, cutting cinematic edits, and leading teams.",
    university: "Wayamba University of Sri Lanka (WUSL)",
    faculty: "Faculty of Applied Sciences",
    statusBadge: "Available for collaborations",
    location: "Sri Lanka",
    bio: [
      "I work at the intersection of software engineering and visual storytelling. As an Applied Science undergraduate at WUSL, I pair analytical rigor with the speed of Vibe Coding to turn real-world problems into functional software.",
      "Outside code, I direct and edit film, design graphics, capture stills, and craft motion graphics. Across both technical builds and creative productions, I lead with clarity and aesthetic discipline."
    ],
    roles: [
      "Vibe Coder",
      "Full-Stack Developer",
      "Cinematographer",
      "Video Editor",
      "Motion Graphics Artist",
      "Applied Science Undergrad",
      "Leader at Core"
    ],
    contacts: {
      email: "hello@yourdomain.com",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com"
    }
  },

  stats: [
    { label: "Institution", value: "WUSL", detail: "Applied Sciences" },
    { label: "Discipline", value: "Code + Film", detail: "Logic & Aesthetics" },
    { label: "Works", value: "35+", detail: "Apps, Cuts & Visuals" },
    { label: "Core", value: "Leadership", detail: "Direction & Impact" }
  ],

  arsenal: {
    tech: [
      { name: "React / Vite", level: "Core", desc: "Fast, component-driven interactive web applications." },
      { name: "Vibe Coding & AI", level: "Workflow", desc: "Rapid ideation-to-production prototyping with AI tooling." },
      { name: "Tailwind CSS", level: "Interface", desc: "Minimalist, responsive interfaces with precision typography." },
      { name: "JavaScript / Python", level: "Logic", desc: "Application logic, data scripts, and API integrations." },
      { name: "Node.js & Git", level: "Systems", desc: "Backend runtime architecture and clean version control." }
    ],
    creative: [
      { name: "Premiere Pro", level: "Editorial", desc: "Narrative pacing, rhythmic cuts, and audio synchronization." },
      { name: "After Effects", level: "Motion", desc: "Kinetic typography, 2D animation, and title sequences." },
      { name: "DaVinci Resolve", level: "Color", desc: "Cinematic color grading and balanced visual tones." },
      { name: "Cinematography", level: "Camera", desc: "Framing, natural/studio lighting, and 24fps motion feel." },
      { name: "Photoshop & Illustrator", level: "Design", desc: "Brand identity, posters, and clean digital graphics." }
    ],
    leadership: [
      { name: "Student Leadership", level: "Community", desc: "Leading student teams, organizing campus initiatives, and unifying vision." },
      { name: "Creative Direction", level: "Production", desc: "Guiding video and design projects from concept through final delivery." },
      { name: "Applied Problem Solving", level: "Science", desc: "Translating complex real-world problems into direct, practical software." }
    ]
  },

  projects: [
    {
      id: "vibe-pulse",
      title: "PulseFlow: Task Cockpit",
      category: "dev",
      featured: true,
      tag: "Vibe Coding / Web App",
      summary: "A minimalist productivity workspace built to remove university workflow bottlenecks with keyboard-first navigation, local persistence, and focus timers.",
      techStack: ["React", "Tailwind CSS", "LocalStorage", "Vite"],
      demoUrl: "#",
      githubUrl: "https://github.com"
    },
    {
      id: "wusl-documentary",
      title: "Campus Chronicles: WUSL",
      category: "video",
      featured: true,
      tag: "Cinematography & Edit",
      summary: "A short documentary film capturing student life, laboratory research, and campus atmosphere at Wayamba University with deliberate pacing and grading.",
      techStack: ["Sony Alpha", "Premiere Pro", "DaVinci Resolve", "Sound Design"],
      demoUrl: "#",
      githubUrl: ""
    },
    {
      id: "motion-brand-reel",
      title: "Kinetic Velocity: Motion Pack",
      category: "motion",
      featured: true,
      tag: "Motion Graphics",
      summary: "Clean title animations, geometric transitions, and minimal HUD overlays crafted with precise curve easing and sound sync.",
      techStack: ["After Effects", "Illustrator", "Lottie"],
      demoUrl: "#",
      githubUrl: ""
    },
    {
      id: "applied-sci-data",
      title: "Lab Data Visualizer",
      category: "dev",
      featured: false,
      tag: "Applied Science / Tool",
      summary: "Analytical web utility for plotting laboratory datasets, variance metrics, and regression curves in real time.",
      techStack: ["React", "Python", "Data Plotting", "Tailwind CSS"],
      demoUrl: "#",
      githubUrl: "https://github.com"
    },
    {
      id: "visual-identity-fest",
      title: "Symposium Visual Identity",
      category: "design",
      featured: false,
      tag: "Graphic Design",
      summary: "Complete visual system for a university cultural and tech symposium: stage screens, editorial posters, and digital assets.",
      techStack: ["Photoshop", "Illustrator", "Typography"],
      demoUrl: "#",
      githubUrl: ""
    },
    {
      id: "cinematic-frames",
      title: "Golden Hour & Street Stills",
      category: "photo",
      featured: false,
      tag: "Photography",
      summary: "Monochrome and low-key portrait photography series exploring natural campus light, shadow geometry, and candid expression.",
      techStack: ["Prime Lenses", "Lightroom", "Natural Light"],
      demoUrl: "#",
      githubUrl: ""
    }
  ],

  gallery: [
    {
      title: "Anamorphic Campus Twilight",
      category: "Cinematography",
      gear: "50mm f/1.8 • 1/250s • ISO 100",
      description: "Wayamba University courtyard captured during late twilight."
    },
    {
      title: "Late Night Vibe Coding",
      category: "Workspace",
      gear: "35mm • f/2.0 • 1/60s • ISO 800",
      description: "Prototyping minimalist interfaces and refining application state."
    },
    {
      title: "Kinetic Wave Study",
      category: "Motion Graphics",
      gear: "After Effects • 60 FPS • Vector",
      description: "Procedural monochrome motion study exploring rhythm and easing."
    },
    {
      title: "Student Symposium Direction",
      category: "Leadership",
      gear: "Crew Lead • Stage & Media Production",
      description: "Coordinating production teams for the annual university symposium."
    }
  ],

  leadershipPillars: [
    {
      number: "01",
      title: "Analytical Rigor",
      desc: "Approaching ambiguity with scientific structure, hypothesis testing, and clean problem decomposition."
    },
    {
      number: "02",
      title: "Vibe Coding Velocity",
      desc: "Moving from idea to functional software at speed while keeping code clean and interfaces restrained."
    },
    {
      number: "03",
      title: "Cinematic Restraint",
      desc: "Intentional framing, disciplined pacing, and visual clarity across film, motion, and graphic design."
    },
    {
      number: "04",
      title: "Leadership at Core",
      desc: "Setting clear direction, backing teammates, and uniting creative and technical people around real goals."
    }
  ]
};
