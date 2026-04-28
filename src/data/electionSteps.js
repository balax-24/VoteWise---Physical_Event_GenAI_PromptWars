export const timelinePhases = [
  { 
    phase: "Announcement", 
    icon: "📢", 
    description: "Election Commission announces election dates and Model Code of Conduct begins.", 
    color: "#1a3a5c" 
  },
  { 
    phase: "Voter Registration", 
    icon: "📋", 
    description: "Citizens verify or update their voter ID. Deadline is usually 7-10 days before polling.", 
    color: "#2563eb" 
  },
  { 
    phase: "Candidate Nomination", 
    icon: "✍️", 
    description: "Candidates file nominations, which are then scrutinized and finalized.", 
    color: "#7c3aed" 
  },
  { 
    phase: "Campaign Period", 
    icon: "📣", 
    description: "Parties and candidates campaign. Ends 48 hours before polling (Silent Period).", 
    color: "#db2777" 
  },
  { 
    phase: "Polling Day", 
    icon: "🗳️", 
    description: "Voters visit booths, verify identity, and cast votes on EVMs.", 
    color: "#f4a623" 
  },
  { 
    phase: "Vote Counting", 
    icon: "🔢", 
    description: "EVM results are tabulated under supervision. Results declared constituency-wise.", 
    color: "#16a34a" 
  },
  { 
    phase: "Result Declaration", 
    icon: "🏆", 
    description: "Winning candidates are certified. Government formation process begins.", 
    color: "#0891b2" 
  }
];

export const votingSteps = [
  {
    id: 1,
    title: "Check your name on the voter list",
    description: "Verify your registration status on the official ECI portal.",
    icon: "✅",
    link: "https://electoralsearch.eci.gov.in"
  },
  {
    id: 2,
    title: "Carry valid ID",
    description: "Bring Voter ID, Aadhaar, Passport, or other approved identification.",
    icon: "📄"
  },
  {
    id: 3,
    title: "Find your assigned polling booth",
    description: "Locate your booth using the Polling Booth Finder or ECI portal.",
    icon: "📍"
  },
  {
    id: 4,
    title: "Go during polling hours",
    description: "Booths are typically open from 7:00 AM to 6:00 PM.",
    icon: "⏰"
  },
  {
    id: 5,
    title: "Identity Verification",
    description: "First polling officer checks your name and ID proof.",
    icon: "🔍"
  },
  {
    id: 6,
    title: "Cast your vote on the EVM",
    description: "Press the blue button next to your candidate's symbol.",
    icon: "👆"
  },
  {
    id: 7,
    title: "Get ink mark on finger",
    description: "Polling officer puts indelible ink on your left forefinger.",
    icon: "🖊️"
  },
  {
    id: 8,
    title: "You've voted!",
    description: "Collect your slip if applicable, and share your experience.",
    icon: "🎉"
  }
];
