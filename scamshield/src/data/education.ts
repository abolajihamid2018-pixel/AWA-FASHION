export interface Topic {
  id: string;
  title: string;
  icon: 'phishing' | 'investment' | 'romance' | 'job' | 'impersonation' | 'otp' | 'links';
  summary: string;
  signs: string[];
  actions: string[];
}

export const TOPICS: Topic[] = [
  {
    id: 'phishing',
    title: 'Phishing',
    icon: 'phishing',
    summary:
      'Messages or emails pretending to be from a trusted organisation so you hand over passwords, card details or personal information.',
    signs: [
      'A generic greeting such as "Dear Customer"',
      'Urgent warnings that your account will be closed or blocked',
      'A link that leads to a website with a slightly wrong name',
      'Requests to "verify" or "update" your details',
    ],
    actions: [
      'Do not click links in unexpected messages. Go to the official website or app yourself.',
      'Check the sender address or number carefully, but remember they can be faked.',
      'When in doubt, contact the organisation using details from its official website.',
    ],
  },
  {
    id: 'investment',
    title: 'Investment scams',
    icon: 'investment',
    summary:
      'Offers that promise large, fast or "guaranteed" profits, often from crypto, forex or "doubling" schemes. Early investors may be paid with later investors\' money until the scheme collapses.',
    signs: [
      'Guaranteed returns or "zero risk"',
      'Returns that are far higher than banks or regulated funds offer',
      'Pressure to join quickly or recruit friends and family',
      'Recruitment through WhatsApp, Telegram or social media',
    ],
    actions: [
      "Check whether the company is registered with the Securities and Exchange Commission (SEC) Nigeria using the SEC's official website.",
      'Never invest money you cannot afford to lose.',
      'Be sceptical of screenshots of profits and testimonials. They are easy to fake.',
    ],
  },
  {
    id: 'romance',
    title: 'Romance scams',
    icon: 'romance',
    summary:
      'Someone builds an online relationship over weeks or months, then asks for money for an emergency, travel, customs fees or an investment.',
    signs: [
      'They refuse or keep postponing video calls',
      'They profess strong feelings very quickly',
      'They live abroad or work somewhere hard to verify (military, oil rig, ship)',
      'Stories of emergencies that need money urgently',
    ],
    actions: [
      'Never send money or gift cards to someone you have not met in person.',
      'Search their photos with a reverse image search to see if they appear elsewhere.',
      'Talk to a friend or family member you trust before sending anything.',
    ],
  },
  {
    id: 'jobs',
    title: 'Fake job offers',
    icon: 'job',
    summary:
      'Fake recruiters offer well-paid jobs, often remote or abroad, then ask for "registration", "training" or "visa processing" fees, or for your personal documents.',
    signs: [
      'You are "shortlisted" for a job you never applied for',
      'High pay for little or no experience',
      'Any fee required before you start',
      'Interviews only by chat, with no official company email',
    ],
    actions: [
      'Never pay to get a job.',
      "Find the company's official website yourself and confirm the vacancy exists.",
      'Do not send your ID, BVN or bank details before the employer is verified.',
    ],
  },
  {
    id: 'impersonation',
    title: 'Impersonation',
    icon: 'impersonation',
    summary:
      'Scammers pretend to be someone you know (a friend, relative or boss) or an authority such as a bank, government agency or delivery company.',
    signs: [
      'A message from a "new number" claiming to be someone you know',
      'Requests for money or airtime with a reason not to call',
      'Officials asking for payment to avoid arrest or fines',
      'Profile photos copied from the real person',
    ],
    actions: [
      'Call the person on a number you already have for them.',
      'Ask a question only the real person would know.',
      'Genuine government agencies do not demand payment through personal accounts.',
    ],
  },
  {
    id: 'otp',
    title: 'OTP fraud',
    icon: 'otp',
    summary:
      'A one-time password (OTP) is a short code that approves a transaction or login. Anyone who gets your OTP can take money from your account or take over your accounts.',
    signs: [
      'Anyone asking you to read out or forward a code you received',
      'Callers claiming to be from your bank who "just need to confirm" a code',
      'Messages saying a code was sent "by mistake" and asking you to return it',
    ],
    actions: [
      'Never share an OTP, PIN or password with anyone, including bank staff.',
      'Read the full OTP message: it often says what the code is approving.',
      'If you shared a code, call your bank immediately using the number on your card.',
    ],
  },
  {
    id: 'links',
    title: 'Malicious links',
    icon: 'links',
    summary:
      'Links can lead to fake login pages, scam shops or downloads that harm your device. A link\'s text can say one thing while it leads somewhere else.',
    signs: [
      'Misspelt names, such as an "l" in place of an "i"',
      'A familiar name placed before an unfamiliar domain, such as "bank.example-login.com"',
      'Shortened links from people you do not know',
      'Links asking you to download an app or file',
    ],
    actions: [
      'Type important addresses yourself or use the official app.',
      'Remember that a padlock (HTTPS) only means the connection is encrypted, not that the site is honest.',
      'Do not install apps from links in messages. Use the official app store.',
    ],
  },
];

export const REPORTING_GUIDANCE = [
  {
    title: 'Your bank',
    body: 'If money or bank details are involved, call your bank first, using the number on your card or its official website. Speed matters.',
  },
  {
    title: 'Economic and Financial Crimes Commission (EFCC)',
    body: 'Reports of fraud can be made through the EFCC\'s official website.',
  },
  {
    title: 'Nigeria Police Force cybercrime unit',
    body: 'Cybercrime can be reported to the Nigeria Police Force National Cybercrime Centre.',
  },
  {
    title: 'The platform it came through',
    body: 'Report and block the sender on WhatsApp, Instagram, Facebook or your email provider so the account can be investigated.',
  },
];
