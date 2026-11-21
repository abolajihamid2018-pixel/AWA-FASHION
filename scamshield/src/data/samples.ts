import type { AnalysisResult, SubmissionType } from '../lib/types';

/**
 * DEMONSTRATION DATA ONLY.
 *
 * These are hand-written example reports used in Stage 1 so the interface can
 * be built and reviewed before any detection engine exists. Every score,
 * indicator and verdict below was written by a person, not produced by code
 * that examined the content.
 *
 * All organisations named here ("Zenix Bank", "Primeway Logistics", etc.) are
 * fictional.
 */

export interface Sample {
  id: string;
  type: SubmissionType;
  /** Short label shown on the "Try an example" chips. */
  chip: string;
  content: string;
  report: Omit<AnalysisResult, 'id' | 'createdAt' | 'isSimulated' | 'sampleId' | 'sampleContent' | 'type'>;
}

const MESSAGE_LIMITS = [
  'Simulated report: this example was written by hand to preview the interface. No detection engine has examined it.',
  'ScamShield cannot confirm who actually sent a message. Sender names and numbers can be faked.',
];

const URL_LIMITS = [
  'Simulated report: this example was written by hand to preview the interface. No threat intelligence service was checked.',
  'The link was not opened. Real URL checks in Stage 3 will also never open links in your browser.',
];

export const SAMPLES: Sample[] = [
  {
    id: 'msg-bank-otp',
    type: 'message',
    chip: 'Bank OTP request',
    content:
      'Dear Customer, your Zenix Bank account has been RESTRICTED due to incomplete BVN update. To avoid permanent blocking within 30 minutes, reply with the 6-digit OTP sent to your phone and your ATM PIN. Call our verification officer on 0812 345 6789. Zenix Bank Security Team.',
    report: {
      score: 94,
      level: 'CRITICAL',
      title: 'Bank account "restriction" message',
      summary:
        'This message follows a well-known bank impersonation pattern. It asks for your OTP and ATM PIN, which no genuine bank will ever request.',
      confidence: 'high',
      indicators: [
        {
          id: 'otp_request',
          title: 'Asks for your OTP',
          explanation:
            'A one-time password (OTP) authorises transactions on your account. Anyone who has it can move your money. Banks never ask you to share it.',
          severity: 'high',
          evidence: 'reply with the 6-digit OTP sent to your phone',
          points: 35,
        },
        {
          id: 'pin_request',
          title: 'Asks for your ATM PIN',
          explanation: 'Your PIN should never be shared with anyone, including bank staff.',
          severity: 'high',
          evidence: 'and your ATM PIN',
          points: 30,
        },
        {
          id: 'urgency_threat',
          title: 'Deadline and threat of account loss',
          explanation:
            'Scammers create panic ("within 30 minutes", "permanent blocking") so you act before you think or check.',
          severity: 'medium',
          evidence: 'To avoid permanent blocking within 30 minutes',
          points: 15,
        },
        {
          id: 'bank_impersonation',
          title: 'Claims to be from a bank',
          explanation:
            'The message uses a bank name and a "Security Team" sign-off to look official, but gives a personal mobile number to call.',
          severity: 'medium',
          evidence: 'Call our verification officer on 0812 345 6789',
          points: 14,
        },
      ],
      recommendations: [
        'Do not reply and do not share your OTP, PIN or BVN with anyone.',
        'Do not call the number in the message.',
        'Contact your bank using the number on the back of your card or on its official website.',
        'If you have already shared any details, call your bank immediately and ask them to block your account and cards.',
        'Report the message to your bank so it can warn other customers.',
      ],
      limitations: MESSAGE_LIMITS,
    },
  },
  {
    id: 'msg-investment',
    type: 'message',
    chip: 'Investment offer',
    content:
      'Make money while you sleep!! Invest ₦50,000 today and receive ₦250,000 in just 7 days. 100% guaranteed, zero risk. Over 3,000 Nigerians already earning. Only 5 slots left. DM our account manager on Telegram @ProfitKingNG to start now.',
    report: {
      score: 72,
      level: 'HIGH',
      title: '"5× in 7 days" investment offer',
      summary:
        'This offer promises returns that no legitimate investment can guarantee and pushes you to an unofficial chat channel. These are strong signs of an investment or Ponzi scam.',
      confidence: 'medium',
      indicators: [
        {
          id: 'unrealistic_returns',
          title: 'Unrealistic guaranteed returns',
          explanation:
            'A 400% profit in a week is not achievable by real investments. Genuine investments carry risk and never promise "100% guaranteed" returns.',
          severity: 'high',
          evidence: 'Invest ₦50,000 today and receive ₦250,000 in just 7 days. 100% guaranteed',
          points: 32,
        },
        {
          id: 'scarcity_pressure',
          title: 'Pressure to act quickly',
          explanation: '"Only 5 slots left" is a pressure tactic designed to stop you from researching the offer.',
          severity: 'medium',
          evidence: 'Only 5 slots left',
          points: 14,
        },
        {
          id: 'unofficial_channel',
          title: 'Moves you to an unofficial channel',
          explanation:
            'Registered investment firms do not recruit through anonymous Telegram accounts. Private chats make the scammer hard to trace.',
          severity: 'medium',
          evidence: 'DM our account manager on Telegram @ProfitKingNG',
          points: 16,
        },
        {
          id: 'social_proof',
          title: 'Unverifiable popularity claims',
          explanation: 'Claims like "3,000 Nigerians already earning" cannot be checked and are used to make the offer feel safe.',
          severity: 'low',
          evidence: 'Over 3,000 Nigerians already earning',
          points: 10,
        },
      ],
      recommendations: [
        'Do not send money or personal details.',
        'Check whether the company is registered with the Securities and Exchange Commission (SEC) Nigeria on its official website.',
        'Be wary of anyone who contacts you about investments through WhatsApp or Telegram.',
        'If you have already paid, keep every receipt and chat, contact your bank and report it to the EFCC.',
      ],
      limitations: MESSAGE_LIMITS,
    },
  },
  {
    id: 'msg-fake-job',
    type: 'message',
    chip: 'Remote job offer',
    content:
      'Congratulations! You have been shortlisted for a remote Data Entry role with Primeway Logistics UK. Salary: $900 per week, no experience needed. To confirm your slot, pay a refundable registration fee of ₦15,000 to the account below within 24 hours. Interview will hold on WhatsApp.',
    report: {
      score: 66,
      level: 'HIGH',
      title: 'Remote job asking for a "registration fee"',
      summary:
        'Real employers do not charge you to get a job. An upfront fee, a high salary for no experience and a WhatsApp-only interview point strongly to a fake job offer.',
      confidence: 'medium',
      indicators: [
        {
          id: 'upfront_fee',
          title: 'Asks you to pay before you are hired',
          explanation:
            '"Registration", "processing" or "training" fees are the main way fake job scams make money. Genuine employers pay you, not the other way round.',
          severity: 'high',
          evidence: 'pay a refundable registration fee of ₦15,000',
          points: 30,
        },
        {
          id: 'too_good_to_be_true',
          title: 'High pay for no experience',
          explanation: 'Offers far above normal pay for unskilled remote work are used as bait.',
          severity: 'medium',
          evidence: '$900 per week, no experience needed',
          points: 14,
        },
        {
          id: 'unsolicited_shortlist',
          title: 'You were "shortlisted" without applying',
          explanation: 'If you do not remember applying, the message was probably sent to many people at once.',
          severity: 'low',
          evidence: 'You have been shortlisted',
          points: 8,
        },
        {
          id: 'unofficial_channel',
          title: 'Interview only on WhatsApp',
          explanation: 'Legitimate companies normally interview through official email, video calls or in person.',
          severity: 'medium',
          evidence: 'Interview will hold on WhatsApp',
          points: 14,
        },
      ],
      recommendations: [
        'Do not pay any fee to secure a job.',
        "Look the company up yourself and contact it through its official website, not the details in the message.",
        'Do not send copies of your ID, BVN or bank details until you have verified the employer.',
        'Report the account the fee was requested into to the bank that holds it.',
      ],
      limitations: MESSAGE_LIMITS,
    },
  },
  {
    id: 'msg-new-number',
    type: 'message',
    chip: '"I changed my number"',
    content:
      "Hi, it's me. I lost my phone so this is my new number, please save it. Are you free? I need a small favour, will explain.",
    report: {
      score: 38,
      level: 'MEDIUM',
      title: '"New number" message from an unknown contact',
      summary:
        'This could be genuine, but it matches the opening of a common impersonation scam where someone pretends to be a friend or relative before asking for money.',
      confidence: 'low',
      indicators: [
        {
          id: 'identity_unverified',
          title: 'Sender does not say who they are',
          explanation:
            '"It\'s me" from an unknown number lets the reader fill in a name. Scammers rely on this to impersonate people you know.',
          severity: 'medium',
          evidence: "Hi, it's me. I lost my phone so this is my new number",
          points: 18,
        },
        {
          id: 'favour_hook',
          title: 'Vague request for a favour',
          explanation: 'A "small favour" is often followed by an urgent request for money or airtime.',
          severity: 'medium',
          evidence: 'I need a small favour, will explain',
          points: 20,
        },
        {
          id: 'no_payment_request',
          title: 'No money or details requested yet',
          explanation: 'The message itself does not ask for money, passwords or codes, which keeps the risk below HIGH.',
          severity: 'info',
          points: 0,
        },
      ],
      recommendations: [
        'Call the person on the number you already have for them, or ask a question only they would know.',
        'Do not send money or airtime until you have confirmed who it is.',
        'If they refuse to call or keep pushing for money, treat it as a scam.',
      ],
      limitations: [
        ...MESSAGE_LIMITS,
        'Short messages give little evidence. This one could easily be genuine.',
      ],
    },
  },
  {
    id: 'msg-legit',
    type: 'message',
    chip: 'Everyday message',
    content:
      'Hi Tolu, the project meeting has moved to 3pm on Thursday in Room B12. Please bring the printed survey results. Thanks, Dr. Adeyemi',
    report: {
      score: 4,
      level: 'LOW',
      title: 'Meeting update',
      summary:
        'No common scam warning signs were found. The message makes no request for money, codes or personal details.',
      confidence: 'medium',
      indicators: [
        {
          id: 'no_sensitive_request',
          title: 'No sensitive request',
          explanation: 'The message does not ask for money, passwords, OTPs or personal information.',
          severity: 'info',
          points: 0,
        },
        {
          id: 'no_links',
          title: 'No links or attachments',
          explanation: 'There is nothing to click, which removes a common route for phishing.',
          severity: 'info',
          points: 0,
        },
        {
          id: 'specific_context',
          title: 'Specific, verifiable details',
          explanation: 'Names, times and a room number can be checked easily with the sender.',
          severity: 'low',
          points: 4,
        },
      ],
      recommendations: [
        'No action is needed, but a low score is not a guarantee.',
        'If something about it feels off, confirm with the sender through a channel you already use.',
      ],
      limitations: [
        ...MESSAGE_LIMITS,
        'A low score means no warning signs were found. It does not prove a message is safe.',
      ],
    },
  },
  {
    id: 'url-lookalike',
    type: 'url',
    chip: 'Lookalike bank login',
    content: 'http://zenlx-bank.secure-login-verify.com/account/update?ref=8812',
    report: {
      score: 84,
      level: 'CRITICAL',
      title: 'Lookalike "bank login" link',
      summary:
        'This link imitates a bank name with a swapped letter and hides it inside a different website. It is very likely a phishing page built to steal login details.',
      confidence: 'medium',
      indicators: [
        {
          id: 'lookalike_domain',
          title: 'Imitates a bank name',
          explanation:
            '"zenlx" swaps the letter "i" for "l" to look like "zenix" at a glance. Lookalike names are a classic phishing trick.',
          severity: 'high',
          evidence: 'zenlx-bank',
          points: 30,
        },
        {
          id: 'deceptive_subdomain',
          title: 'The real website is something else',
          explanation:
            'The part that decides who owns a link is the end of the domain: here, "secure-login-verify.com". The bank-like name in front of it means nothing.',
          severity: 'high',
          evidence: 'secure-login-verify.com',
          points: 24,
        },
        {
          id: 'no_https',
          title: 'Not encrypted (no HTTPS)',
          explanation:
            'Information sent to this page could be read in transit. Note that HTTPS alone would not make it trustworthy either: scam sites use HTTPS too.',
          severity: 'medium',
          evidence: 'http://',
          points: 12,
        },
        {
          id: 'credential_keywords',
          title: 'Login and "verify" wording',
          explanation: 'Words like "secure", "login", "verify" and "update" are common in phishing links.',
          severity: 'medium',
          evidence: 'secure-login-verify … /account/update',
          points: 18,
        },
      ],
      recommendations: [
        'Do not open the link or enter any details.',
        'Visit your bank by typing its address yourself or using its official app.',
        'If you entered a password, change it now from the official app and call your bank.',
        'Delete the message that contained the link.',
      ],
      limitations: [
        ...URL_LIMITS,
        'Domain age, certificate details and threat-intelligence reports were not checked in this demo.',
      ],
    },
  },
  {
    id: 'url-shortened',
    type: 'url',
    chip: 'Shortened link',
    content: 'https://bit.ly/3Xq9zKp',
    report: {
      score: 35,
      level: 'MEDIUM',
      title: 'Shortened link with a hidden destination',
      summary:
        'Link shorteners are used by legitimate services and by scammers. The real destination is hidden, so treat it with caution until it is known.',
      confidence: 'low',
      indicators: [
        {
          id: 'url_shortener',
          title: 'Destination is hidden',
          explanation:
            'A short link can lead anywhere. Scammers use them to disguise phishing pages. In Stage 3 ScamShield will safely look up where it leads without opening it in your browser.',
          severity: 'medium',
          evidence: 'bit.ly',
          points: 25,
        },
        {
          id: 'https_present',
          title: 'Uses HTTPS',
          explanation: 'The connection to the shortener is encrypted. This says nothing about where it leads.',
          severity: 'info',
          points: 0,
        },
        {
          id: 'no_context',
          title: 'No surrounding context',
          explanation: 'Without the message it came with, there is little evidence either way.',
          severity: 'low',
          points: 10,
        },
      ],
      recommendations: [
        'Do not open it unless you trust the person who sent it and expected the link.',
        'Ask the sender what the link is for.',
        'If it came with an urgent or money-related message, check that message too.',
      ],
      limitations: [...URL_LIMITS, 'The final destination of the short link was not resolved in this demo.'],
    },
  },
  {
    id: 'url-legit',
    type: 'url',
    chip: 'Well-known website',
    content: 'https://www.wikipedia.org/',
    report: {
      score: 5,
      level: 'LOW',
      title: 'Well-known website homepage',
      summary: 'No suspicious structure was found in this link. It points to the homepage of a long-established website.',
      confidence: 'medium',
      indicators: [
        {
          id: 'simple_structure',
          title: 'Simple, readable address',
          explanation: 'No unusual characters, hidden subdomains, IP addresses or misleading words.',
          severity: 'info',
          points: 0,
        },
        {
          id: 'https_present',
          title: 'Uses HTTPS',
          explanation: 'The connection is encrypted. HTTPS on its own does not prove a site is trustworthy.',
          severity: 'low',
          points: 5,
        },
      ],
      recommendations: [
        'It still makes sense to check the address bar after the page loads.',
        'Be cautious if a page asks for login details you did not expect to enter.',
      ],
      limitations: [
        ...URL_LIMITS,
        'A low score means no warning signs were found in the link itself. It is not a guarantee.',
      ],
    },
  },
];

export function getSample(id: string): Sample | undefined {
  return SAMPLES.find((s) => s.id === id);
}

export function samplesFor(type: SubmissionType): Sample[] {
  return SAMPLES.filter((s) => s.type === type);
}
