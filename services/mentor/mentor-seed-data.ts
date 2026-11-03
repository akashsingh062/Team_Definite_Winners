import { IMentorProfile } from "@/types/mentor";

export const SEED_MENTORS: Partial<IMentorProfile>[] = [
  {
    userId: "seed_mentor_arjun_sharma",
    displayName: "Arjun Sharma",
    headline: "Staff Software Engineer @ Google | Distributed Systems & Scalability",
    organization: "Google",
    currentRole: "Staff Software Engineer",
    experienceYears: 10,
    expertise: [
      "Software Engineering",
      "Distributed Systems",
      "System Design",
      "Cloud Architecture",
    ],
    skills: ["Go", "C++", "Java", "Kubernetes", "Microservices", "System Design"],
    languages: ["English", "Hindi"],
    biography:
      "Passionate engineer with 10+ years architecting hyper-scale systems at Google. Keen on mentoring early-career engineers on system design, coding best practices, and landing roles in tier-1 tech companies.",
    education: [
      {
        degree: "M.Tech in Computer Science",
        field: "Computer Science & Engineering",
        institution: "IIT Bombay",
        year: 2014,
      },
    ],
    professionalLinks: {
      linkedin: "https://linkedin.com/in/arjun-sharma-tech",
      github: "https://github.com/arjunsharma",
    },
    credentials: [
      {
        title: "Google Certified Professional Cloud Architect",
        issuingOrg: "Google Cloud",
        year: 2021,
        verified: true,
      },
    ],
    verificationStatus: "verified",
    verifiedAt: new Date("2024-01-15"),
    verifiedBy: "system_admin",
    availability: {
      isAcceptingRequests: true,
      maxActiveMentees: 6,
      weeklyHours: 4,
      preferredDays: ["Saturday", "Sunday"],
      timeSlots: [
        {
          day: "Saturday",
          startTime: "10:00",
          endTime: "12:00",
          timezone: "Asia/Kolkata",
        },
        {
          day: "Sunday",
          startTime: "15:00",
          endTime: "17:00",
          timezone: "Asia/Kolkata",
        },
      ],
      timezone: "Asia/Kolkata",
    },
    rating: {
      average: 4.9,
      count: 24,
    },
  },
  {
    userId: "seed_mentor_priya_nair",
    displayName: "Dr. Priya Nair",
    headline: "Principal AI Researcher @ Microsoft Research | GenAI & NLP",
    organization: "Microsoft Research",
    currentRole: "Principal AI Scientist",
    experienceYears: 8,
    expertise: [
      "Artificial Intelligence",
      "Machine Learning",
      "Natural Language Processing",
      "Research & Publications",
    ],
    skills: ["Python", "PyTorch", "Transformers", "LLMs", "RAG", "Data Science"],
    languages: ["English", "Malayalam", "Hindi"],
    biography:
      "PhD in Artificial Intelligence. Leading frontier generative AI initiatives. Love helping students navigate machine learning research papers, thesis projects, and transitioning into industry AI labs.",
    education: [
      {
        degree: "Ph.D. in Artificial Intelligence",
        field: "Computer Science",
        institution: "IISc Bangalore",
        year: 2017,
      },
    ],
    professionalLinks: {
      linkedin: "https://linkedin.com/in/priya-nair-ai",
      github: "https://github.com/priyanair",
    },
    credentials: [
      {
        title: "Senior Member IEEE",
        issuingOrg: "IEEE Computer Society",
        year: 2020,
        verified: true,
      },
    ],
    verificationStatus: "verified",
    verifiedAt: new Date("2024-02-10"),
    verifiedBy: "system_admin",
    availability: {
      isAcceptingRequests: true,
      maxActiveMentees: 4,
      weeklyHours: 3,
      preferredDays: ["Sunday"],
      timeSlots: [
        {
          day: "Sunday",
          startTime: "11:00",
          endTime: "14:00",
          timezone: "Asia/Kolkata",
        },
      ],
      timezone: "Asia/Kolkata",
    },
    rating: {
      average: 5.0,
      count: 18,
    },
  },
  {
    userId: "seed_mentor_rohit_verma",
    displayName: "Rohit Verma",
    headline: "Lead Full-Stack Engineer @ Stripe | Next.js, React & Node.js",
    organization: "Stripe",
    currentRole: "Staff Frontend Engineer",
    experienceYears: 7,
    expertise: [
      "Frontend Development",
      "Full-Stack Development",
      "Web Performance",
      "Portfolio Reviews",
    ],
    skills: ["TypeScript", "Next.js", "React", "Node.js", "Tailwind CSS", "GraphQL"],
    languages: ["English", "Hindi"],
    biography:
      "Specialized in high-conversion, accessible web applications and developer tooling. Passionate about reviewing student projects, GitHub portfolios, and preparing for modern frontend technical interviews.",
    education: [
      {
        degree: "B.Tech in Information Technology",
        field: "Information Technology",
        institution: "NIT Surathkal",
        year: 2017,
      },
    ],
    professionalLinks: {
      linkedin: "https://linkedin.com/in/rohit-verma-dev",
      github: "https://github.com/rohitverma",
      portfolio: "https://rohitverma.dev",
    },
    credentials: [],
    verificationStatus: "verified",
    verifiedAt: new Date("2024-03-01"),
    verifiedBy: "system_admin",
    availability: {
      isAcceptingRequests: true,
      maxActiveMentees: 5,
      weeklyHours: 4,
      preferredDays: ["Friday", "Saturday"],
      timeSlots: [
        {
          day: "Friday",
          startTime: "18:00",
          endTime: "20:00",
          timezone: "Asia/Kolkata",
        },
      ],
      timezone: "Asia/Kolkata",
    },
    rating: {
      average: 4.8,
      count: 32,
    },
  },
  {
    userId: "seed_mentor_ananya_sen",
    displayName: "Ananya Sen",
    headline: "Career Counsellor & Interview Coach | Ex-McKinsey & Talent Advisory",
    organization: "NextGen Talent Advisory",
    currentRole: "Director of Career Mentorship",
    experienceYears: 9,
    expertise: [
      "Career Counselling",
      "Resume & Cover Letter Review",
      "Behavioral Interview Preparation",
      "Career Transitions",
    ],
    skills: ["Resume Crafting", "Mock Interviews", "Salary Negotiation", "Storytelling"],
    languages: ["English", "Bengali", "Hindi"],
    biography:
      "Helped over 500+ undergraduate and postgraduate students bridge the college-to-corporate divide. Expert in ATS-friendly resume structuring, STAR interview techniques, and career mapping.",
    education: [
      {
        degree: "MBA in Human Resources",
        field: "Human Resources Management",
        institution: "XLRI Jamshedpur",
        year: 2015,
      },
    ],
    professionalLinks: {
      linkedin: "https://linkedin.com/in/ananya-sen-coach",
    },
    credentials: [
      {
        title: "Certified Professional Career Coach (CPCC)",
        issuingOrg: "Professional Association of Resume Writers & Career Coaches",
        year: 2018,
        verified: true,
      },
    ],
    verificationStatus: "verified",
    verifiedAt: new Date("2024-01-20"),
    verifiedBy: "system_admin",
    availability: {
      isAcceptingRequests: true,
      maxActiveMentees: 8,
      weeklyHours: 6,
      preferredDays: ["Wednesday", "Saturday"],
      timeSlots: [
        {
          day: "Wednesday",
          startTime: "17:00",
          endTime: "20:00",
          timezone: "Asia/Kolkata",
        },
      ],
      timezone: "Asia/Kolkata",
    },
    rating: {
      average: 4.95,
      count: 45,
    },
  },
  {
    userId: "seed_mentor_kavita_reddy",
    displayName: "Kavita Reddy",
    headline: "Senior Cloud & Security Architect @ Amazon Web Services (AWS)",
    organization: "Amazon Web Services",
    currentRole: "Senior Solutions Architect",
    experienceYears: 11,
    expertise: [
      "Cloud Architecture",
      "Cybersecurity",
      "DevOps & SRE",
      "Certification Guidance",
    ],
    skills: ["AWS", "Docker", "Terraform", "CI/CD", "Network Security", "Linux"],
    languages: ["English", "Telugu", "Hindi"],
    biography:
      "Enterprise cloud security veteran with deep experience in multi-region failover, zero-trust security architectures, and container orchestration. Mentoring students on cloud certs and real-world infrastructure.",
    education: [
      {
        degree: "B.E. in Electronics & Communication",
        field: "Electronics",
        institution: "Osmania University",
        year: 2013,
      },
    ],
    professionalLinks: {
      linkedin: "https://linkedin.com/in/kavita-reddy-cloud",
    },
    credentials: [
      {
        title: "AWS Certified Solutions Architect – Professional",
        issuingOrg: "Amazon Web Services",
        year: 2022,
        verified: true,
      },
    ],
    verificationStatus: "verified",
    verifiedAt: new Date("2024-02-15"),
    verifiedBy: "system_admin",
    availability: {
      isAcceptingRequests: true,
      maxActiveMentees: 5,
      weeklyHours: 3,
      preferredDays: ["Saturday"],
      timeSlots: [
        {
          day: "Saturday",
          startTime: "14:00",
          endTime: "17:00",
          timezone: "Asia/Kolkata",
        },
      ],
      timezone: "Asia/Kolkata",
    },
    rating: {
      average: 4.85,
      count: 19,
    },
  },
  // Pending mentor for testing verification workflow
  {
    userId: "seed_mentor_siddharth_joshi",
    displayName: "Siddharth Joshi",
    headline: "Full-Stack Developer @ Infosys | Junior Mentor Candidate",
    organization: "Infosys",
    currentRole: "Senior Systems Engineer",
    experienceYears: 3,
    expertise: ["Full-Stack Development", "Java Spring Boot", "Angular"],
    skills: ["Java", "Spring Boot", "Angular", "MySQL"],
    languages: ["English", "Marathi"],
    biography: "Applying to share practical enterprise project experience with junior college students.",
    education: [
      {
        degree: "B.Tech in Computer Engineering",
        field: "Computer Engineering",
        institution: "Pune University",
        year: 2021,
      },
    ],
    professionalLinks: {
      linkedin: "https://linkedin.com/in/siddharth-joshi-dev",
    },
    credentials: [],
    verificationStatus: "pending",
    availability: {
      isAcceptingRequests: false,
      maxActiveMentees: 2,
      weeklyHours: 2,
      preferredDays: ["Sunday"],
      timeSlots: [],
      timezone: "Asia/Kolkata",
    },
    rating: { average: 0, count: 0 },
  },
];
