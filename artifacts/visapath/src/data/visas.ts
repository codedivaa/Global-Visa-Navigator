export type Visa = {
  id: string;
  name: string;
  country: string;
  flag: string;
  processingTime: string;
  estimatedCost: string;
  requirements: string[];
  description: string;
};

export const visas: Visa[] = [
  { id: 'h1b', name: 'H-1B Specialty Occupation', country: 'USA', flag: '🇺🇸', processingTime: '3-6 months', estimatedCost: '$3,500-$5,000', requirements: ['Bachelor+ degree', 'US job offer', 'Specialty occupation'], description: 'Work visa for specialty occupation workers sponsored by US employer' },
  { id: 'o1a', name: 'O-1A Extraordinary Ability', country: 'USA', flag: '🇺🇸', processingTime: '2-3 months', estimatedCost: '$5,000-$10,000', requirements: ['Extraordinary ability proof', 'US employer or agent', 'Awards/publications/salary evidence'], description: 'For individuals with extraordinary ability in sciences, education, business, or athletics' },
  { id: 'eb2niw', name: 'EB-2 NIW', country: 'USA', flag: '🇺🇸', processingTime: '12-24 months', estimatedCost: '$700-$4,000', requirements: ['Advanced degree or exceptional ability', 'National interest benefit', 'Self-petition allowed'], description: 'Green card for advanced degree holders with work that benefits the US national interest' },
  { id: 'canada-ee', name: 'Express Entry', country: 'Canada', flag: '🇨🇦', processingTime: '6-9 months', estimatedCost: 'CAD $1,325', requirements: ['CRS score 470+', 'Language proficiency', 'Work experience 1+ year'], description: 'Points-based permanent residency for skilled workers' },
  { id: 'germany-oc', name: 'Opportunity Card', country: 'Germany', flag: '🇩🇪', processingTime: '2-3 months', estimatedCost: '75 EUR application', requirements: ['Recognized qualification', 'Basic German or English', 'Sufficient funds'], description: 'Job search visa allowing you to find work in Germany for up to 1 year' },
  { id: 'uk-sw', name: 'Skilled Worker Visa', country: 'UK', flag: '🇬🇧', processingTime: '3-5 months', estimatedCost: '610-1,408 GBP', requirements: ['UK job offer', 'English B1+', 'Minimum salary 26,200 GBP'], description: 'Work visa for skilled workers with a UK employer sponsor' },
  { id: 'australia-189', name: 'Skilled Independent (189)', country: 'Australia', flag: '🇦🇺', processingTime: '12-18 months', estimatedCost: 'AUD $4,640', requirements: ['Skills assessment', 'Points 65+', 'Under 45 years old'], description: 'Points-based permanent residency visa - no employer sponsorship needed' },
];