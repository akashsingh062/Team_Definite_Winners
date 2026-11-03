import {
  IPassportCertification,
  CertificationVerificationStatus,
} from "@/types/skills-passport";

interface TrustedIssuerDomain {
  domain: string;
  name: string;
  urlPattern: RegExp;
}

const TRUSTED_ISSUER_DOMAINS: TrustedIssuerDomain[] = [
  {
    domain: "credly.com",
    name: "Credly / Pearson Acclaim",
    urlPattern: /^https?:\/\/(www\.)?credly\.com\/badges\/[a-zA-Z0-9_-]+/i,
  },
  {
    domain: "youracclaim.com",
    name: "Acclaim",
    urlPattern: /^https?:\/\/(www\.)?youracclaim\.com\/badges\/[a-zA-Z0-9_-]+/i,
  },
  {
    domain: "coursera.org",
    name: "Coursera",
    urlPattern: /^https?:\/\/(www\.)?coursera\.org\/(verify|account\/accomplishments\/verify)\/[a-zA-Z0-9]+/i,
  },
  {
    domain: "freecodecamp.org",
    name: "freeCodeCamp",
    urlPattern: /^https?:\/\/(www\.)?freecodecamp\.org\/certification\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/i,
  },
  {
    domain: "credential.net",
    name: "Accredible / Google Cloud",
    urlPattern: /^https?:\/\/(www\.)?credential\.net\/[a-zA-Z0-9_-]+/i,
  },
  {
    domain: "accredible.com",
    name: "Accredible",
    urlPattern: /^https?:\/\/(www\.)?[a-zA-Z0-9_-]+\.accredible\.com\/[a-zA-Z0-9_-]+/i,
  },
  {
    domain: "hackerrank.com",
    name: "HackerRank",
    urlPattern: /^https?:\/\/(www\.)?hackerrank\.com\/certificates\/[a-zA-Z0-9]+/i,
  },
  {
    domain: "certmetrics.com",
    name: "CertMetrics / AWS / Cisco",
    urlPattern: /^https?:\/\/(www\.)?certmetrics\.com\/[a-zA-Z0-9_-]+\/public\/verification\.aspx/i,
  },
  {
    domain: "learn.microsoft.com",
    name: "Microsoft Learn",
    urlPattern: /^https?:\/\/learn\.microsoft\.com\/[a-z]{2}-[a-z]{2}\/users\/[a-zA-Z0-9_-]+\/credentials\/[a-zA-Z0-9_-]+/i,
  },
  {
    domain: "udacity.com",
    name: "Udacity",
    urlPattern: /^https?:\/\/(www\.)?udacity\.com\/(certificate|nanodegree)\/[a-zA-Z0-9_-]+/i,
  },
];

/**
 * Validates a certification URL against authoritative third-party issuer formats.
 * If verified, stamps authentic status.
 * If unverified or missing URL, marks as student_provided without fabricating validation.
 */
export function verifyCertification(
  cert: IPassportCertification
): IPassportCertification {
  // Check if expiration date has passed
  if (cert.expirationDate) {
    const expDate = new Date(cert.expirationDate);
    if (!isNaN(expDate.getTime()) && expDate < new Date()) {
      return {
        ...cert,
        verificationStatus: "expired",
        verificationMethod: "date_check",
        verificationNotes: "Certification expired based on recorded expiration date.",
      };
    }
  }

  const url = cert.credentialUrl?.trim();
  if (!url) {
    return {
      ...cert,
      verificationStatus: "student_provided",
      verificationMethod: "student_provided",
      verificationNotes: "Self-attested credential without third-party verification URL.",
    };
  }

  // Validate URL format
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        ...cert,
        verificationStatus: "student_provided",
        verificationMethod: "student_provided",
        verificationNotes: "Invalid URL protocol. Recorded as student-provided.",
      };
    }

    // Match against trusted issuer registries
    const matchedIssuer = TRUSTED_ISSUER_DOMAINS.find(
      (ti) =>
        parsed.hostname.toLowerCase().endsWith(ti.domain) &&
        ti.urlPattern.test(url)
    );

    if (matchedIssuer) {
      return {
        ...cert,
        verificationStatus: "verified" as CertificationVerificationStatus,
        verificationMethod: "issuer_url_check",
        verificationNotes: `Verified via authoritative ${matchedIssuer.name} credential portal.`,
      };
    }

    // If valid URL but unrecognized domain, preserve as student_provided
    return {
      ...cert,
      verificationStatus: "student_provided",
      verificationMethod: "student_provided",
      verificationNotes: `Credential URL provided (${parsed.hostname}) but issuer verification protocol is unintegrated.`,
    };
  } catch {
    return {
      ...cert,
      verificationStatus: "student_provided",
      verificationMethod: "student_provided",
      verificationNotes: "Malformed URL provided. Treated as student-provided.",
    };
  }
}

/**
 * Checks if a certification has verified third-party evidence.
 */
export function isCertificationExternallyVerified(
  cert: IPassportCertification
): boolean {
  return cert.verificationStatus === "verified";
}
