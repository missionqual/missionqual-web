// Glossary: data center terms matched to the oil and gas words people already know.
// Draft for founder review (Chidi, Lonnie). Owners and contractors word some of these
// differently; "plant" is left blank where there's no honest equivalent.

export type GlossaryArea = "power" | "cooling" | "commissioning" | "quality" | "site";

export const GLOSSARY_AREAS: Record<GlossaryArea, string> = {
  power: "Power",
  cooling: "Cooling",
  commissioning: "Commissioning",
  quality: "QA/QC and turnover",
  site: "Site and safety",
};

export type GlossaryTerm = {
  slug: string;
  term: string;
  aka?: string;
  area: GlossaryArea;
  definition: string;
  /** The closest oil and gas word or idea, if there is one. */
  plant?: string;
};

export const GLOSSARY: GlossaryTerm[] = [
  // Power
  { slug: "ups", term: "UPS", aka: "Uninterruptible power supply", area: "power",
    definition: "Batteries and electronics that carry the servers for the seconds or minutes between a utility outage and the generators taking the load.",
    plant: "Like a UPS on a DCS or safety system, scaled up to run a whole building." },
  { slug: "generator", term: "Standby generator", area: "power",
    definition: "Diesel or gas generators that start automatically when utility power is lost and carry the site until it comes back. Large campuses have dozens.",
    plant: "Emergency generator, but sized to carry the full critical load." },
  { slug: "ats", term: "ATS", aka: "Automatic transfer switch", area: "power",
    definition: "Switches a load from utility power to generator power, and back, without anyone touching it." },
  { slug: "switchgear", term: "Switchgear", area: "power",
    definition: "The breakers and buses that distribute power from the utility and generators to the rest of the building. Usually medium voltage in, low voltage out.",
    plant: "Same word, same idea as plant substations and MCC lineups." },
  { slug: "pdu", term: "PDU", aka: "Power distribution unit", area: "power",
    definition: "A transformer and panel cabinet in or near the data hall that feeds power to the server racks." },
  { slug: "busway", term: "Busway", aka: "Bus duct", area: "power",
    definition: "Overhead metal-enclosed conductors that carry power along a row of racks, with plug-in tap-off boxes instead of individual circuits.",
    plant: "Bus duct, used far more heavily here." },
  { slug: "redundancy", term: "N+1, 2N", area: "power",
    definition: "How much backup a system has. N is what the load needs; N+1 adds one spare unit; 2N doubles everything so either side can carry the full load alone.",
    plant: "Like running spare pumps or dual trains, written as a design rule." },
  { slug: "load-bank", term: "Load bank", area: "power",
    definition: "Portable equipment that draws power and makes heat like servers would, so systems can be tested at full load before any servers are installed." },
  { slug: "epms", term: "EPMS", aka: "Electrical power monitoring system", area: "power",
    definition: "Software and meters that watch every breaker, UPS and generator in real time and log every event." },

  // Cooling
  { slug: "chiller", term: "Chiller", area: "cooling",
    definition: "Makes chilled water for the building by pulling heat out of the water loop. Usually a row of large units in a central plant.",
    plant: "Same machine as a plant chiller, with tighter uptime rules." },
  { slug: "cooling-tower", term: "Cooling tower", area: "cooling",
    definition: "Rejects the heat collected by the chillers to the outside air.",
    plant: "Same as a refinery cooling tower, usually smaller and in multiples." },
  { slug: "chilled-water-loop", term: "Chilled water loop", area: "cooling",
    definition: "The piping that carries cold water from the chillers to the cooling units in the data halls and back. Mostly B31.9 building services piping.",
    plant: "Cooling water system, built to B31.9 instead of B31.3." },
  { slug: "crah", term: "CRAH", aka: "Computer room air handler", area: "cooling",
    definition: "A fan and coil unit that uses chilled water to cool the air in the data hall." },
  { slug: "crac", term: "CRAC", aka: "Computer room air conditioner", area: "cooling",
    definition: "Like a CRAH, but with its own refrigerant compressor instead of chilled water." },
  { slug: "containment", term: "Hot aisle / cold aisle containment", area: "cooling",
    definition: "Walls, doors and ceilings around rows of racks that keep cold supply air and hot exhaust air from mixing." },
  { slug: "liquid-cooling", term: "Liquid cooling", aka: "Direct-to-chip", area: "cooling",
    definition: "Coolant piped right to cold plates on the processors instead of cooling the room air. Standard on new AI data halls.",
    plant: "Closer to process piping than HVAC: cleanliness, flushing and leak testing matter a lot." },
  { slug: "cdu", term: "CDU", aka: "Coolant distribution unit", area: "cooling",
    definition: "Pumps, heat exchanger and controls that move coolant between the building water loop and the liquid-cooled racks.",
    plant: "A skid with pumps and a heat exchanger." },
  { slug: "bms", term: "BMS", aka: "Building management system", area: "cooling",
    definition: "The control system that runs and monitors the mechanical equipment: chillers, pumps, CRAHs, valves and alarms.",
    plant: "The DCS for the building's mechanical side." },

  // Commissioning
  { slug: "cxa", term: "CxA", aka: "Commissioning agent / authority", area: "commissioning",
    definition: "The firm hired, usually by the owner, to write the test scripts, witness the tests and confirm every system works as designed.",
    plant: "Like the commissioning team plus an owner's witness in one firm." },
  { slug: "l1", term: "Level 1 (L1)", aka: "Factory witness test", area: "commissioning",
    definition: "Equipment is tested at the factory before it ships.", plant: "FAT." },
  { slug: "l2", term: "Level 2 (L2)", aka: "Site acceptance", area: "commissioning",
    definition: "Delivery and installation checks on site: receiving inspection, nameplates against submittals, damage, torque, labels.",
    plant: "Receiving inspection and installation QC." },
  { slug: "l3", term: "Level 3 (L3)", aka: "Pre-functional / startup", area: "commissioning",
    definition: "First power-up and vendor startup, with pre-functional checklists signed. \"Level 3 complete\" is a project milestone.",
    plant: "Pre-commissioning. \"Level 3 complete\" is close to mechanical completion." },
  { slug: "l4", term: "Level 4 (L4)", aka: "Functional performance test", area: "commissioning",
    definition: "Each system is tested on its own against its sequence of operations, often on load banks.",
    plant: "System commissioning and function checks." },
  { slug: "l5", term: "Level 5 (L5)", aka: "Integrated systems test (IST)", area: "commissioning",
    definition: "Everything is tested together by failing it on purpose: utility power is pulled, the UPS rides through, generators pick up and cooling has to hold.",
    plant: "No exact match. The closest is startup trip and ESD testing on a new unit." },
  { slug: "pfc", term: "Pre-functional checklist (PFC)", area: "commissioning",
    definition: "The checklist signed at L2 and L3 to show a piece of equipment is installed and ready to test.",
    plant: "ITRs and check sheets." },
  { slug: "soo", term: "Sequence of operations (SOO)", area: "commissioning",
    definition: "The written description of how a system should behave in every mode, including failures. The L4 tests are built from it.",
    plant: "Cause and effect, plus the control narrative." },
  { slug: "issues-log", term: "Issues log", area: "commissioning",
    definition: "The CxA's running list of problems found during commissioning, tracked to closure.",
    plant: "Like a punch list, kept by the commissioning team." },
  { slug: "rfs", term: "RFS", aka: "Ready for service", area: "commissioning",
    definition: "The date a data hall is handed to the owner to install servers. Everything on the job works back from it.",
    plant: "Like the startup date the whole turnaround schedule hangs on." },

  // QA/QC and turnover
  { slug: "itp", term: "ITP", aka: "Inspection and test plan", area: "quality",
    definition: "Lists every inspection and test for a scope, who does it, and where the hold and witness points are.",
    plant: "Same word, same document." },
  { slug: "hold-point", term: "Hold point / witness point", area: "quality",
    definition: "A hold point stops work until the named party inspects. A witness point needs notice, but work can go on if they don't show.",
    plant: "Same terms." },
  { slug: "ncr", term: "NCR", aka: "Non-conformance report", area: "quality",
    definition: "Records work that doesn't meet the spec and how it will be fixed. Usually tracked in the GC's software.",
    plant: "Same term." },
  { slug: "submittal", term: "Submittal", area: "quality",
    definition: "Product data, drawings or samples a sub sends for approval before buying or installing. QA checks the installed item against it.",
    plant: "Vendor data and approved-for-construction documents." },
  { slug: "rfi", term: "RFI", aka: "Request for information", area: "quality",
    definition: "A formal question to the designer when the drawings or specs are unclear or conflict.",
    plant: "Technical query (TQ)." },
  { slug: "punch-list", term: "Punch list", area: "quality",
    definition: "Remaining items to fix before a system or area is accepted.", plant: "Same term." },
  { slug: "turnover-package", term: "Turnover documentation package", area: "quality",
    definition: "Every record for a system, from submittals and inspections to test reports and checklists, handed to the owner. Split by system and phase.",
    plant: "Turnover or completions package." },
  { slug: "procore", term: "Procore / ACC Build", area: "quality",
    definition: "The cloud software most GCs use for drawings, RFIs, inspections, NCRs and punch lists. Expect to work in it daily.",
    plant: "Replaces the paper forms and spreadsheets many plants still use." },

  // Site and safety
  { slug: "mop", term: "MOP", aka: "Method of procedure", area: "site",
    definition: "A written, step-by-step plan, approved in advance, for any work on live or critical equipment.",
    plant: "Like a detailed switching or isolation procedure." },
  { slug: "nfpa-70e", term: "NFPA 70E", area: "site",
    definition: "The US standard for electrical safety at work: arc-flash boundaries, PPE and energized work permits. Enforced hard on data center sites.",
    plant: "Same standard, applied to far more energized gear." },
  { slug: "data-hall", term: "Data hall", aka: "White space", area: "site",
    definition: "The rooms where the server racks go." },
  { slug: "gray-space", term: "Gray space", area: "site",
    definition: "Everything that supports the data halls: electrical rooms, the chiller plant, generator yards.",
    plant: "Like the utilities side of a plant (OSBL)." },
  { slug: "hyperscale", term: "Hyperscale", area: "site",
    definition: "Very large campuses built by the biggest cloud and AI companies for their own use." },
  { slug: "colocation", term: "Colocation", aka: "Colo", area: "site",
    definition: "A data center that rents space, power and cooling to many tenants." },
  { slug: "mission-critical", term: "Mission critical", area: "site",
    definition: "Construction where downtime isn't acceptable: data centers, hospitals, some labs. Job titles use it to mean data center work." },
  { slug: "badging", term: "Badging", area: "site",
    definition: "Getting your site access badge: background check, drug test and safety orientation. It can take days to weeks.",
    plant: "Like TWIC and site orientation, often stricter." },
];
