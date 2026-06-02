export type Visa = {
  id: string;
  name: string;
  country: string;
  countryKey: string;
  flag: string;
  processingTime: string;
  estimatedCost: string;
  requirements: string[];
  description: string;
  sponsorshipRequired: boolean;
  languageRequirement?: string;
};

export const visas: Visa[] = [
  // ── USA ──────────────────────────────────────────────────────────────────────
  {
    id: 'h1b', name: 'H-1B Specialty Occupation', country: 'USA', countryKey: 'usa', flag: '🇺🇸',
    processingTime: '3–6 months', estimatedCost: '$730–$5,000 (employer)', sponsorshipRequired: true,
    requirements: ["Bachelor's+ in specialty field", 'US employer sponsor', 'Lottery selection (cap 85,000/yr)', 'LCA approved'],
    description: 'Employer-sponsored work visa for specialty occupations; subject to annual lottery.',
  },
  {
    id: 'o1a', name: 'O-1A Extraordinary Ability', country: 'USA', countryKey: 'usa', flag: '🇺🇸',
    processingTime: '2–3 months', estimatedCost: '$5,000–$10,000', sponsorshipRequired: true,
    requirements: ['Extraordinary ability evidence', 'Awards, publications, or salary evidence', 'US employer or agent', '3+ peer review letters'],
    description: 'For individuals with extraordinary ability in sciences, education, business, or athletics.',
  },
  {
    id: 'eb2niw', name: 'EB-2 National Interest Waiver', country: 'USA', countryKey: 'usa', flag: '🇺🇸',
    processingTime: '12–24 months', estimatedCost: '$700–$4,000', sponsorshipRequired: false,
    requirements: ['Advanced degree or exceptional ability', 'National interest benefit statement', 'Self-petition (no sponsor needed)', 'Priority date current'],
    description: 'Green card for advanced degree holders whose work substantially benefits the US national interest.',
  },
  // ── CANADA ───────────────────────────────────────────────────────────────────
  {
    id: 'canada-ee', name: 'Express Entry', country: 'Canada', countryKey: 'canada', flag: '🇨🇦',
    processingTime: '6–9 months', estimatedCost: 'CAD $1,325', sponsorshipRequired: false,
    requirements: ['CRS score 470+ (current cutoff)', 'IELTS CLB 7+ (each band)', '1 yr+ skilled work experience', 'Proof of funds CAD $13,757+'],
    description: 'Points-based permanent residency for skilled workers — fastest PR pathway in Canada.',
  },
  {
    id: 'canada-pnp', name: 'Provincial Nominee Program', country: 'Canada', countryKey: 'canada', flag: '🇨🇦',
    processingTime: '15–24 months', estimatedCost: 'CAD $1,500–$2,500', sponsorshipRequired: false,
    requirements: ['Provincial nomination (adds 600 CRS pts)', 'Skill match with province', 'Job offer in province (some streams)', 'Language CLB 5–7 minimum'],
    description: 'Province-specific skilled worker nomination; nomination adds 600 CRS points, virtually guaranteeing Express Entry invitation.',
  },
  // ── UK ───────────────────────────────────────────────────────────────────────
  {
    id: 'uk-sw', name: 'Skilled Worker Visa', country: 'UK', countryKey: 'uk', flag: '🇬🇧',
    processingTime: '3–5 months', estimatedCost: '£610–£1,408 + IHS', sponsorshipRequired: true,
    requirements: ['Certificate of Sponsorship (CoS)', 'Job on eligible occupations list', 'Salary GBP £26,200+ (or £20,960 shortage)', 'English B1+ (SELT)'],
    description: "UK's main work visa — requires an employer sponsor and a qualifying salary.",
  },
  {
    id: 'uk-gt', name: 'Global Talent Visa', country: 'UK', countryKey: 'uk', flag: '🇬🇧',
    processingTime: '3–8 weeks (endorsement) + 3 weeks (visa)', estimatedCost: '£623', sponsorshipRequired: false,
    requirements: ['Endorsement from a UK recognised body', 'Proven talent or promise in field', 'Tech Nation / Royal Society / British Academy', 'No job offer needed'],
    description: 'For leaders and potential leaders in academia, research, arts, or digital technology — no job offer needed.',
  },
  // ── AUSTRALIA ────────────────────────────────────────────────────────────────
  {
    id: 'australia-189', name: 'Skilled Independent (SC 189)', country: 'Australia', countryKey: 'australia', flag: '🇦🇺',
    processingTime: '12–18 months', estimatedCost: 'AUD $4,640', sponsorshipRequired: false,
    requirements: ['Skills assessment by relevant authority', 'Points score 65+', 'Under 45 years old', 'IELTS 6.0+ overall', 'Invitation from SkillSelect'],
    description: 'Points-based permanent residency — no employer or state sponsorship required.',
  },
  {
    id: 'australia-186', name: 'Employer Nomination Scheme (SC 186)', country: 'Australia', countryKey: 'australia', flag: '🇦🇺',
    processingTime: '9–18 months', estimatedCost: 'AUD $4,640', sponsorshipRequired: true,
    requirements: ['Australian employer nominee', 'Relevant skills and experience', 'Nominated occupation on list', 'Under 45 (unless exempt)', 'IELTS 6.0+'],
    description: 'Employer-sponsored permanent residency for skilled workers nominated by an Australian business.',
  },
  // ── GERMANY ──────────────────────────────────────────────────────────────────
  {
    id: 'germany-oc', name: 'Opportunity Card (Chancenkarte)', country: 'Germany', countryKey: 'germany', flag: '🇩🇪',
    processingTime: '2–3 months', estimatedCost: '€75', sponsorshipRequired: false,
    requirements: ['Recognized qualification (bachelor+ or 2yr vocational)', 'German B2 OR English B2', 'Proof of funds €1,027/month', '6+ points on points system'],
    description: 'Job search visa — move to Germany for up to 1 year to find an employer; no job offer needed upfront.',
  },
  {
    id: 'germany-ebc', name: 'EU Blue Card', country: 'Germany', countryKey: 'germany', flag: '🇩🇪',
    processingTime: '1–3 months', estimatedCost: '€100–€140', sponsorshipRequired: true,
    requirements: ['Recognized university degree (bachelor+)', 'Job offer with salary ≥ €48,300 (or €37,440 shortage)', 'German or English proficiency', 'Work in qualified occupation'],
    description: 'Fast-track work permit for highly qualified non-EU professionals; leads to permanent residency in 21–33 months.',
    languageRequirement: 'German (bonus for B2+)',
  },
  // ── JAPAN ────────────────────────────────────────────────────────────────────
  {
    id: 'japan-engineer', name: 'Engineer / Specialist in Humanities Visa', country: 'Japan', countryKey: 'japan', flag: '🇯🇵',
    processingTime: '1–3 months', estimatedCost: '¥3,000', sponsorshipRequired: true,
    requirements: ['Job offer from Japanese company', "Bachelor's degree (or 10 years experience)", 'Degree relevant to job role', 'Company must be approved'],
    description: "Japan's main work visa for engineers, IT professionals, and specialists in humanities fields.",
    languageRequirement: 'Japanese (N3+ strongly preferred)',
  },
  {
    id: 'japan-hsp', name: 'Highly Skilled Professional (HSP)', country: 'Japan', countryKey: 'japan', flag: '🇯🇵',
    processingTime: '1–2 months', estimatedCost: '¥3,000', sponsorshipRequired: true,
    requirements: ['70+ points on Japan HSP points system', 'Master+ degree preferred', 'Annual salary ¥3M+ (¥4M+ preferred)', 'Japanese OR English proficiency'],
    description: 'Priority visa for high-skill professionals; grants permanent residency eligibility after 1–3 years.',
    languageRequirement: 'Japanese (significant bonus for N2+)',
  },
  {
    id: 'japan-startup', name: 'Business Manager / Startup Visa', country: 'Japan', countryKey: 'japan', flag: '🇯🇵',
    processingTime: '2–4 months', estimatedCost: '¥4,000', sponsorshipRequired: false,
    requirements: ['Business plan approved by municipality', 'Office space in Japan', 'Capital ¥5M+ OR 2 employees', 'Viable business concept'],
    description: 'For entrepreneurs setting up a business in Japan; some municipalities offer a 6-month preparation visa.',
    languageRequirement: 'Japanese (helpful but not required)',
  },
  // ── SOUTH KOREA ──────────────────────────────────────────────────────────────
  {
    id: 'sk-e7', name: 'E-7 Skilled Employment Visa', country: 'South Korea', countryKey: 'south korea', flag: '🇰🇷',
    processingTime: '1–3 months', estimatedCost: '₩130,000', sponsorshipRequired: true,
    requirements: ['Job offer from Korean company', "Bachelor's degree (or 5 years experience)", 'Occupation on eligible list', 'Employer must file petition'],
    description: "Korea's skilled worker visa covering 87 designated professional occupations.",
    languageRequirement: 'Korean (TOPIK 4+ is a major scoring bonus)',
  },
  {
    id: 'sk-d10', name: 'D-10 Job Seeker Visa', country: 'South Korea', countryKey: 'south korea', flag: '🇰🇷',
    processingTime: '2–4 weeks', estimatedCost: '₩50,000', sponsorshipRequired: false,
    requirements: ["Bachelor's degree or higher", 'Minimum annual income of $30,000 (prior year)', 'Graduate of Korean/top-200 university (preferred)', 'Korean TOPIK 3+ (preferred)'],
    description: 'Job search visa allowing graduates and professionals to look for work in South Korea for up to 1 year.',
    languageRequirement: 'Korean (TOPIK preferred)',
  },
  // ── SINGAPORE ────────────────────────────────────────────────────────────────
  {
    id: 'sg-ep', name: 'Employment Pass', country: 'Singapore', countryKey: 'singapore', flag: '🇸🇬',
    processingTime: '3–8 weeks', estimatedCost: 'SGD $105', sponsorshipRequired: true,
    requirements: ['Job offer from Singapore employer', 'Minimum salary SGD $5,600/month ($10,500 for finance)', "Bachelor's degree from reputable university", 'COMPASS score qualifying'],
    description: "Singapore's primary work pass for professionals, managers, and executives.",
  },
  {
    id: 'sg-techpass', name: 'Tech.Pass', country: 'Singapore', countryKey: 'singapore', flag: '🇸🇬',
    processingTime: '4–8 weeks', estimatedCost: 'SGD $225', sponsorshipRequired: false,
    requirements: ['Salary SGD $22,500+/month (last year) OR 5+ years leading tech product', '5+ years senior tech role (at unicorn/startup)', 'OR IPO/raised $30M+ as founder/CXO'],
    description: 'For top global tech talent to work, start businesses, and invest in Singapore — no fixed employer needed.',
  },
  // ── NEW ZEALAND ──────────────────────────────────────────────────────────────
  {
    id: 'nz-skilled', name: 'Skilled Migrant Category', country: 'New Zealand', countryKey: 'new zealand', flag: '🇳🇿',
    processingTime: '12–18 months', estimatedCost: 'NZD $3,910', sponsorshipRequired: false,
    requirements: ['Points 6+ (NZ system)', 'Skilled employment in NZ (or offer)', 'Under 56 years old', 'Health and character requirements', 'IELTS 6.5+ (or equivalent)'],
    description: 'Points-based permanent residency pathway focused on skilled employment in New Zealand.',
  },
  {
    id: 'nz-aewv', name: 'Accredited Employer Work Visa', country: 'New Zealand', countryKey: 'new zealand', flag: '🇳🇿',
    processingTime: '4–8 weeks', estimatedCost: 'NZD $750', sponsorshipRequired: true,
    requirements: ['Job offer from an accredited NZ employer', 'Median wage NZD $29.66+/hr (or role exempt)', 'Relevant skills or qualifications', 'English (IELTS 5.0+ for median-wage roles)'],
    description: 'Work visa for roles offered by NZ-accredited employers; primary route for temporary skilled workers.',
  },
  // ── FRANCE ───────────────────────────────────────────────────────────────────
  {
    id: 'france-tp', name: 'Talent Passport (Passeport Talent)', country: 'France', countryKey: 'france', flag: '🇫🇷',
    processingTime: '2–4 months', estimatedCost: '€99', sponsorshipRequired: false,
    requirements: ['Master+ degree OR exceptional talent', 'Job offer with salary ≥ €43,440 (qualified employee stream)', 'OR recognized talent in arts, research, or business', 'French language B1 (preferred)'],
    description: 'Multi-track residence permit for highly qualified professionals, researchers, artists, and investors in France.',
    languageRequirement: 'French (B2+ preferred; boosts eligibility)',
  },
  // ── NETHERLANDS ──────────────────────────────────────────────────────────────
  {
    id: 'nl-hsm', name: 'Highly Skilled Migrant', country: 'Netherlands', countryKey: 'netherlands', flag: '🇳🇱',
    processingTime: '2–4 weeks', estimatedCost: '€345', sponsorshipRequired: true,
    requirements: ['Job offer from recognized sponsor company', 'Salary ≥ €5,008/month (<30 yrs: €3,672/month)', "Bachelor's degree or higher", 'Company must be IND recognized sponsor'],
    description: 'Fast-track work permit for knowledge migrants (30-day processing); salary is the main criterion.',
  },
  // ── IRELAND ──────────────────────────────────────────────────────────────────
  {
    id: 'ireland-csp', name: 'Critical Skills Employment Permit', country: 'Ireland', countryKey: 'ireland', flag: '🇮🇪',
    processingTime: '8–12 weeks', estimatedCost: '€1,000 (2yr)', sponsorshipRequired: true,
    requirements: ['Job offer in qualifying occupation', 'Salary €38,000+ (Highly Regulated: €30,000+)', "Degree relevant to role", 'Employer registered with DBEI'],
    description: "Ireland's priority work permit for high-demand occupations; fast route to Irish residency and citizenship.",
  },
  // ── SWEDEN ───────────────────────────────────────────────────────────────────
  {
    id: 'sweden-wp', name: 'Work Permit (Arbetstillstånd)', country: 'Sweden', countryKey: 'sweden', flag: '🇸🇪',
    processingTime: '1–3 months', estimatedCost: 'SEK 2,000', sponsorshipRequired: true,
    requirements: ['Job offer from Swedish employer', 'Salary meets sectoral collective agreement minimum', 'Employer advertised role in EU first (some exceptions)', 'Health insurance for first year'],
    description: "Sweden's work permit — relatively straightforward if you have an employer offer; no quota or points system.",
  },
  // ── NORWAY ───────────────────────────────────────────────────────────────────
  {
    id: 'norway-sw', name: 'Skilled Worker Residence Permit', country: 'Norway', countryKey: 'norway', flag: '🇳🇴',
    processingTime: '2–5 months', estimatedCost: 'NOK 6,300', sponsorshipRequired: true,
    requirements: ['Job offer or concrete project in Norway', 'Vocational or higher qualification relevant to job', 'Salary at minimum NOK 365,000/year', 'Must apply before entering Norway'],
    description: 'Residence and work permit for skilled professionals with a qualifying job offer in Norway.',
  },
  // ── SWITZERLAND ──────────────────────────────────────────────────────────────
  {
    id: 'ch-b-permit', name: 'Residence Permit B (Aufenthaltsbewilligung)', country: 'Switzerland', countryKey: 'switzerland', flag: '🇨🇭',
    processingTime: '2–4 months', estimatedCost: 'CHF 65–100', sponsorshipRequired: true,
    requirements: ['Employment contract with Swiss company', 'Employer proves no suitable local candidate', 'Quota availability (non-EU: ~8,500/yr)', 'Recognized qualification'],
    description: 'Annual renewable residence permit for non-EU workers; tied to employer and subject to annual quotas.',
    languageRequirement: 'German/French/Italian (depends on canton)',
  },
];
