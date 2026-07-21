export type MomentModalTemplate = {
  bullets: string[];
};

export type StepCard = {
  title: string;
  body: string;
  badge?: string;
};

export type DualListSection = {
  header: string;
  subtitle?: string;
  leftHeader?: string;
  leftList: string[];
  rightHeader: string;
  rightList: string[];
};

export type MarchMadnessMomentsContent = {
  hero: {
    kicker: string;
    subhead: string;
    titleLines: string[];
    stats: {
      value: string;
      label: string;
      description: string;
      size?: "sm" | "md" | "lg";
    }[];
    sideBarStat: {
      value: string;
      label: string;
      description: string;
    };
  };
  fanCloudComparison: {
    headline: string;
    leftLabel: string;
    rightLabel: string;
    leftImageSrc: string;
    rightImageSrc: string;
    helperText?: string;
    metricsEyebrow: string;
    metrics: {
      value: string;
      label: string;
    }[];
  };
  campaignIntro: {
    title: string;
    subtitle: string;
  };
  proof: {
    body: string;
    chart: {
      title: string;
      subtitle: string;
      bars: {
        value: number;
        label: string;
        color: string;
      }[];
      footnote: string;
    };
  };
  howItWorks: {
    header: string;
    paragraph: string;
    steps: StepCard[];
  };
  moments: {
    header: string;
    introParagraph1: string;
    introParagraph2: string;
    labels: string[];
    modalTemplate: MomentModalTemplate;
  };
  audiences: DualListSection;
  creativeAndChannel: {
    header: string;
    paragraph: string;
    creativeViz: {
      triggerTitle: string;
      exampleLabel: string;
      exampleEvent: string;
      leftAudienceLabel: string;
      leftCardTitle: string;
      leftCardImageSrc?: string;
      leftLead: string;
      leftBody: string;
      rightAudienceLabel: string;
      rightCardTitle: string;
      rightCardImageSrc?: string;
      rightLead: string;
      rightBody: string;
    };
  };
  cta: {
    primaryButtonText: string;
    modalTitle: string;
    modalBody: string;
    email: string;
    closeButtonText: string;
  };
};

export const marchMadnessMomentsContent: MarchMadnessMomentsContent = {
  hero: {
    kicker: "Genius Sports Partnership Opportunities",
    subhead: "Genius Sports is the Exclusive Supplier of Official NCAA Data",
    titleLines: ["March", "Madness", "2026"],
    stats: [
      {
        value: "68",
        label: "Teams",
        description:
          "The largest single-elimination tournament in major U.S. sports",
        size: "lg"
      },
      {
        value: "20",
        label: "Million",
        description:
          "Brackets filled out. The most participatory U.S. sports event",
        size: "md"
      },
      {
        value: "100",
        label: "Million",
        description: "Tournament-wide reach approaches 100 million viewers",
        size: "md"
      }
    ],
    sideBarStat: {
      value: "21",
      label: "Days",
      description: "Three weeks of nonstop live competition"
    }
  },
  fanCloudComparison: {
    headline: "No One Knows March Madness\nFans Better Than Genius Sports",
    leftLabel: "How other data and media partners see March Madness fans.",
    rightLabel: "How Genius Sports sees March Madness fans.",
    leftImageSrc: "/genius_fan_cloud.png",
    rightImageSrc: "/other_fan_cloud.png",
    helperText: "Drag the slider to compare.",
    metricsEyebrow: "",
    metrics: [
      { value: "250 Million", label: "Consumers" },
      { value: "50 Billion", label: "Interactions" },
      { value: "10K", label: "Brands" },
      { value: "5K", label: "Exclusive Brands" },
      { value: "2,500", label: "Communities" }
    ]
  },
  campaignIntro: {
    title: "Genius Sports March Madness Moments",
    subtitle:
      "Connecting brands with fans during the moments that matter most, when emotions are high, history is being made, and brand recall is at its highest."
  },
  proof: {
    body: "Emotional engagement is deeply tied to brand impact, with ads airing immediately after high-surprise gameplay moments delivering nearly 2x higher unaided brand recall.",
    chart: {
      title: "Unaided Brand Recall Following Gameplay Moments",
      subtitle: "(i.e., exposed early in ad break)",
      bars: [
        {
          value: 14,
          label: "Following high-surprise moments",
          color: "#1D26FF"
        },
        {
          value: 7,
          label: "Following low-surprise moments",
          color: "#1EC971"
        }
      ],
      footnote: "*Genius Sports Media Science Research Study 2026"
    }
  },
  howItWorks: {
    header: "Your March Madness Moments Campaign: How it Works",
    paragraph:
      "Addressable ads triggered at precise, emotion-driven moments before, during, or after the game, Genius Moments uses official game data and our Genius Fan Graph segments to deliver targeted creative to the right fans based on the real-time moment that matters most.",
    steps: [
      {
        title: "Choose Your Moment",
        body: "Select the key in-game or tournament moments you want to align your brand with."
      },
      {
        title: "Step 2: Customize Your Audience",
        body: "Choose high-intent fan segments based on fandom, behaviors, and purchase signals."
      },
      {
        title: "Customize Your Creative & Channel",
        badge: "Optional",
        body: "Tailor messaging dynamically to the moment and deliver across CTV, OTT, and digital."
      }
    ]
  },
  moments: {
    header: "Choose Your Moment",
    introParagraph1: "Choose Your Moment",
    introParagraph2:
      "Select the key in-game or tournament moments you want to align your brand with.",
    labels: [
      "GAMEDAY LEAD UP",
      "LATE GAME RALLY",
      "DOWN TO THE WIRE",
      "BUZZER BEATER WIN",
      "ADVANCEMENT",
      "ELIMINATION",
      "UPSET",
      "CINDERELLA STORY",
      "SWEET 16",
      "ELITE 8",
      "FINAL FOUR",
      "CHAMPIONSHIP",
      "CHAMPION",
      "HERO GAME"
    ],
    modalTemplate: {
      bullets: ["What it is", "Why it matters to fans", "Best message types"]
    }
  },
  audiences: {
    header: "Step 2: Customize Your Audience",
    subtitle:
      "The Genius Sports audience desk will create custom addressable segments aligned to your specific campaign goals and target audiences.",
    leftHeader: "Popular March Madness Audiences",
    leftList: [
      "March Madness Fans",
      "Specific Team Fans",
      "Conference Specific",
      "Women’s Sports Fans",
      "Big Sporting Event Fans",
      "Women’s Basketball Fans",
      "Gen Z College Sports Fans",
      "High Value Sports Bettors"
    ],
    rightHeader: "Customize by:",
    rightList: [
      "Demographic + psychographic attributes",
      "Category/brand purchase behavior across 5K+ brands",
      "Category/brand purchase frequency across 5K+ brands",
      "100+ Fluid Fan communities such as Values-Driven Fans, Gen Z fans, Sober Curious Fans"
    ]
  },
  creativeAndChannel: {
    header: "Optional: Customize Your Creative & Channel",
    paragraph:
      "With Genius Sports AI-driven dynamic creative optimization engine, advertisers can tailor their message to each moment, whether it’s a comeback, a buzzer beater, or a Cinderella run. Select content can be pushed across channels, including CTV, OTT, and digital.",
    creativeViz: {
      triggerTitle: "Moment Trigger: Cinderella Run",
      exampleLabel: "Example Event:",
      exampleEvent: "An 11th-seeded VCU makes it to the sweet 16",
      leftAudienceLabel: "March Madness Fans + Existing Brand Purchaser",
      leftCardTitle: "CREATIVE MESSAGE A",
      leftCardImageSrc: "/acme-tv-creative-a-cutout-v2.png",
      leftLead: "Big moments reveal future stars.",
      leftBody:
        "VCU showed us: the biggest stages create the biggest opportunities. Thanks for being a loyal [Brand] customer -- celebrate the rise of the tournament's newest star with 15% off your next purchase.",
      rightAudienceLabel: "March Madness Fans + Competitive Brand Purchaser",
      rightCardTitle: "CREATIVE MESSAGE B",
      rightCardImageSrc: "/acme-tv-creative-b-cutout-v2.png",
      rightLead: "Every tournament creates new stars.",
      rightBody:
        "From under-the-radar to center stage, this March Madness breakout proved anything can happen. New to [Brand]? Start strong with 15% off your first purchase and be ready for whatever emerges next."
    }
  },
  cta: {
    primaryButtonText: "Request Moment-Based Activation",
    modalTitle: "Request Moment-Based Activation",
    modalBody:
      "Thanks for your interest in activating against March Madness moments. Reach out and our team will help map moments, audiences, and creative strategy.",
    email: "sales@geniussports.com",
    closeButtonText: "Close"
  }
};
