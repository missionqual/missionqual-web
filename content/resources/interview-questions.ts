// Interview questions you're likely to get, by role.
// DRAFT for founder review: these are common data center interview topics, written by
// MissionQual. Replace or add questions you and members were actually asked, and set
// `asked: true` on those. Visitors see the first 3 per role in full; members see all.

export type InterviewRole = "qaqc-inspector" | "qaqc-manager" | "commissioning" | "turnover";

export const INTERVIEW_ROLES: Record<InterviewRole, string> = {
  "qaqc-inspector": "QA/QC inspector",
  "qaqc-manager": "QA/QC manager",
  commissioning: "Commissioning technician or agent",
  turnover: "Turnover and document control",
};

export type InterviewQuestion = {
  role: InterviewRole;
  question: string;
  /** What the interviewer is really checking. */
  checking: string;
  /** How to answer it using oil and gas experience. */
  answer: string;
  /** The common mistake. */
  mistake: string;
  /** True once a founder or member confirms they were asked this. */
  asked?: boolean;
};

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // QA/QC inspector
  { role: "qaqc-inspector",
    question: "Walk me through the commissioning levels, L1 to L5.",
    checking: "Whether you understand where QA/QC work sits in the project, not whether you've done all five.",
    answer: "Name each level in one line, then say where you'd spend most of your time: L2 receiving and installation checks, and the paperwork that has to be complete before L3. Tie it to the receiving and installation inspections you did on plant work.",
    mistake: "Pretending you've run L5 tests, or saying you've never heard of the levels." },
  { role: "qaqc-inspector",
    question: "How do you handle a sub who won't fix an item you've written up?",
    checking: "Whether you can hold the line without becoming the problem on site.",
    answer: "Point to the spec or submittal, document it in the NCR or punch system, and escalate through the GC's process, not by arguing in the field. Give one real example from a turnaround.",
    mistake: "Making it personal, or letting it slide to keep the peace." },
  { role: "qaqc-inspector",
    question: "What do you check when a piece of equipment arrives on site?",
    checking: "Your receiving inspection discipline.",
    answer: "Damage, nameplate data against the approved submittal, shipping splits and parts, factory test reports present, storage requirements. It's the same habit as receiving on a plant, so say that.",
    mistake: "Listing only visual damage." },
  { role: "qaqc-inspector",
    question: "Have you used Procore, ACC Build or another construction QA software?",
    checking: "How fast you'll be useful in their system.",
    answer: "Be honest. If you haven't, name what you have used for inspections, NCRs and punch lists, and say you'll learn theirs in the first week.",
    mistake: "Claiming experience you don't have. It shows on day one." },
  { role: "qaqc-inspector",
    question: "What's different about B31.9 piping compared with B31.3?",
    checking: "Whether a piping inspector will adjust to building services work.",
    answer: "Lower test pressures and simpler requirements, and the flush and water treatment matter more than the hydro. Say you'd read the project's flushing spec first.",
    mistake: "Treating it like process piping and over-inspecting." },

  // QA/QC manager
  { role: "qaqc-manager",
    question: "How would you set up the quality program on a new data hall?",
    checking: "Whether you can build a program, not just run inspections.",
    answer: "ITPs per scope, hold and witness points agreed with the owner and CxA, a single NCR and punch system, weekly quality metrics, and turnover packages planned from day one. Compare it to a turnaround QA plan, scaled to a longer job.",
    mistake: "Describing a refinery program without mentioning the CxA or turnover by phase." },
  { role: "qaqc-manager",
    question: "How do you work with the commissioning agent?",
    checking: "Whether you'll fight the CxA or help them hit dates.",
    answer: "Get their checklists and scripts early, make sure L2 and L3 paperwork is complete before they show up, and track their issues log alongside your punch list.",
    mistake: "Treating the CxA as an outside inspector to manage around." },
  { role: "qaqc-manager",
    question: "Tell me about an NCR that affected the schedule. What did you do?",
    checking: "Judgment under schedule pressure.",
    answer: "A real example: what was found, how you contained it, who you told, how it was dispositioned, and what changed so it didn't repeat.",
    mistake: "Picking an example where nothing was at stake." },
  { role: "qaqc-manager",
    question: "What metrics would you report to the owner every week?",
    checking: "Whether you manage with data.",
    answer: "Open and closed NCRs by trade, inspection pass rate, punch items by area, turnover packages complete against plan.",
    mistake: "Saying you'd report everything." },
  { role: "qaqc-manager",
    question: "How do you get subs who've never had a strict QA program to follow one?",
    checking: "Leadership on site.",
    answer: "A kickoff with each sub on the ITP, early inspections on their first work so expectations are set, and fast feedback. Bring a turnaround example where you did the same with contract crews.",
    mistake: "Relying only on NCRs." },

  // Commissioning
  { role: "commissioning",
    question: "What's the difference between a pre-functional checklist and a functional test?",
    checking: "Basic commissioning vocabulary.",
    answer: "Pre-functional confirms equipment is installed right and ready to run (L2 and L3). Functional proves it does what the sequence of operations says, in every mode (L4).",
    mistake: "Using the two terms interchangeably." },
  { role: "commissioning",
    question: "Walk me through what happens in an IST.",
    checking: "Whether you understand what the whole job is building toward.",
    answer: "Load banks stand in for servers, utility power is pulled, the UPS carries the load, generators start and pick up, and cooling has to hold, all while everything is logged. Compare it to startup trip or ESD testing if you've done it.",
    mistake: "Describing it as one system test." },
  { role: "commissioning",
    question: "Have you done loop checks or point-to-point checks?",
    checking: "Hands-on controls experience.",
    answer: "Most I&E people have. Describe your process and the tools, then connect it to BMS and EPMS points.",
    mistake: "Underselling plant I&E work because it wasn't in a data center." },
  { role: "commissioning",
    question: "How do you write up an issue during testing?",
    checking: "Whether your issues will be useful to the people fixing them.",
    answer: "What was tested, the expected result, the actual result, the location and equipment tag, a photo or trend, and who owns the fix.",
    mistake: "Vague write-ups like \"pump didn't work.\"" },
  { role: "commissioning",
    question: "Are you comfortable working around energized equipment?",
    checking: "Safety, and NFPA 70E awareness.",
    answer: "Talk about your energized work training, permits and PPE, and that you follow the MOP step by step.",
    mistake: "Bragging about working hot without permits." },

  // Turnover and document control
  { role: "turnover",
    question: "How do you organize a turnover package?",
    checking: "Whether you can build what the owner actually accepts.",
    answer: "By system and phase, against the owner's index: submittals, inspections, test reports, checklists, O&M manuals, warranties. Same as completions on a plant, with the CxA reviewing before L3.",
    mistake: "Organizing by trade instead of by system." },
  { role: "turnover",
    question: "What document control software have you used?",
    checking: "Ramp-up time.",
    answer: "Name what you've used and the volume you handled, and say you'll learn theirs fast. Most use Procore, ACC or the owner's own system.",
    mistake: "Listing only Excel." },
  { role: "turnover",
    question: "How do you track what's missing before a turnover date?",
    checking: "Whether you'll surprise people at the deadline.",
    answer: "A register of every required document per system with status, reviewed weekly with the trades, and missing items escalated early.",
    mistake: "Waiting until the package is due." },
  { role: "turnover",
    question: "How do you handle a revision to a drawing that's already been used in the field?",
    checking: "Revision control discipline.",
    answer: "Distribute the new revision, pull and mark the old one superseded, and flag any work built to the old one for QA review.",
    mistake: "Just saving the new file." },
  { role: "turnover",
    question: "Why are you moving from oil and gas to data centers?",
    checking: "Whether you'll stay.",
    answer: "Steady long-term work, the scale of the build-out, and that your completions experience fits. Keep it positive about oil and gas.",
    mistake: "Complaining about your last job." },
];
