/**
 * Static catalog of all VishTV YouTube channel videos.
 * Used as primary data when Sanity is not configured,
 * and as fallback for watch pages to avoid "Untitled".
 *
 * Source: YouTube RSS feed for @vishvavahinitv4206
 * Channel ID: UCeqWSlqqNO2F5zPWq-pQEcA
 */

export interface CatalogVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  programme?: string;
  category?: string;
}

export const videoCatalog: CatalogVideo[] = [
  {
    id: "htcFVMsLbJk",
    title: "යාරා තීරය | Dharshika Madukanda",
    description: "යාරා තීරය — Dharshika Madukanda speaks on community life, culture and personal stories from the Sri Lankan diaspora in Australia.",
    publishedAt: "2026-05-12T04:40:59+00:00",
    programme: "යාරා තීරය",
    category: "Talk Show",
  },
  {
    id: "iWOrK15ATxY",
    title: "යාරා තීරය | Silvana Colombage",
    description: "යාරා තීරය — Silvana Colombage shares her experiences and insights on the Sri Lankan community in Melbourne.",
    publishedAt: "2026-05-12T04:39:54+00:00",
    programme: "යාරා තීරය",
    category: "Talk Show",
  },
  {
    id: "nHyP8vTLaMI",
    title: "LIVE | Vishvavahini TV Live",
    description: "Watch Vishvavahini TV live — Sri Lankan community television broadcasting from Melbourne to the world. News, current affairs, drama and entertainment.",
    publishedAt: "2026-05-07T12:34:52+00:00",
    programme: "Live Stream",
    category: "Live",
  },
  {
    id: "hwYFMIj4C9M",
    title: "යාරා තීරය | Kusumsiri Jayakody",
    description: "යාරා තීරය — veteran actor Kusumsiri Jayakody discusses Sri Lankan arts, theatre and the creative community in Australia.",
    publishedAt: "2026-04-16T10:51:23+00:00",
    programme: "යාරා තීරය",
    category: "Talk Show",
  },
  {
    id: "fHOcCEgv2S4",
    title: "Christine Gunawardena | Interview",
    description: "An in-depth conversation with Christine Gunawardena on community leadership, cultural preservation and the Sri Lankan Australian experience.",
    publishedAt: "2026-03-21T09:55:34+00:00",
    programme: "යාරා තීරය",
    category: "Talk Show",
  },
  {
    id: "pOEdsSQ65A4",
    title: "Dr.Erosha — Exercise for Health",
    description: "Dr.Erosha සමග සෞඛ්‍යමත් ජීවිතයක් — the importance of exercise for a healthy lifestyle. Tips, routines and expert medical advice for the diaspora community.",
    publishedAt: "2026-02-23T17:07:15+00:00",
    programme: "Dr.Erosha",
    category: "Health",
  },
  {
    id: "Z9blDjQPR3k",
    title: "ඕස්ට්‍රේලියාවේ ජීවත්වන අපි සහ අරගලය",
    description: "Life in Australia and the struggle — a documentary-style look at the challenges and triumphs of the Sri Lankan community abroad.",
    publishedAt: "2026-02-18T16:04:09+00:00",
    programme: "Community Connect",
    category: "Current Affairs",
  },
  {
    id: "1aHOjfUx7-o",
    title: "Australia Sri Lanka Business Forum",
    description: "Coverage of the Australia Sri Lanka Business Forum — connecting entrepreneurs, investors and businesses across both nations. info@aslbf.org.au",
    publishedAt: "2026-02-18T13:28:33+00:00",
    programme: "Me and My Business",
    category: "Business",
  },
  {
    id: "uOf5EK_C_sg",
    title: "Dr.Erosha — Sustainable Healthy Eating",
    description: "Dr.Erosha සමග සෞඛ්‍යමත් ජීවිතයක් — sustainable healthy eating patterns for long-term wellness. Expert advice on nutrition and diet.",
    publishedAt: "2026-02-17T08:39:58+00:00",
    programme: "Dr.Erosha",
    category: "Health",
  },
  {
    id: "mjjJPfCIgI8",
    title: "කූඹියන්ට තිත — Ant-Proof Tray",
    description: "A creative DIY solution from the community — the Ant-Proof Tray. Practical tips for everyday life in Australia.",
    publishedAt: "2026-01-31T20:08:26+00:00",
    programme: "Community Connect",
    category: "Lifestyle",
  },
  {
    id: "TZL1on78kkQ",
    title: "Me and My Business | MINSKHI",
    description: "Meet MINSKHI — a Sri Lankan Australian entrepreneur building their business dream. From startup to success in the land down under.",
    publishedAt: "2026-01-27T18:39:27+00:00",
    programme: "Me and My Business",
    category: "Business",
  },
  {
    id: "uMbq_BwOB4E",
    title: "ප්‍රජා සම්බන්ධතා | Research & Development",
    description: "ප්‍රජා සම්බන්ධතා — exploring research and development commercialization opportunities for the Sri Lankan community in Australia.",
    publishedAt: "2026-01-25T13:36:04+00:00",
    programme: "Community Connect",
    category: "Current Affairs",
  },
  {
    id: "R9DYx3tZSlM",
    title: "Community Connect | දවස් 07න් ඩොලර් ලක්ෂයක්",
    description: "The inspiring story of a Sri Lankan who raised $100,000 in just 7 days — community spirit and generosity in action.",
    publishedAt: "2026-01-22T18:35:00+00:00",
    programme: "Community Connect",
    category: "Current Affairs",
  },
  {
    id: "ogp8DyhBmr4",
    title: "Sporting Live | 2026 ක්‍රීඩා ලෝකය",
    description: "Sporting Live — a look at the 2026 sports world, Sri Lankan athletes in Australia, cricket updates and community sporting events.",
    publishedAt: "2026-01-21T19:18:07+00:00",
    programme: "Sporting Live",
    category: "Sport",
  },
  {
    id: "Tq3-WiOM_X0",
    title: "සතියෙන් ඩොලර් 100,000ක් පරිත්‍යාග කළ ලාංකිකයෝ",
    description: "Sina's Kitchen Biryani Fundraising Project — how the Sri Lankan community raised $100,000 in a week through food and fellowship.",
    publishedAt: "2026-01-03T02:05:28+00:00",
    programme: "Community Connect",
    category: "Current Affairs",
  },
];

/** Look up a video by YouTube ID */
export function getVideoFromCatalog(videoId: string): CatalogVideo | null {
  return videoCatalog.find((v) => v.id === videoId) || null;
}

/** Get videos by programme name */
export function getVideosByProgramme(programme: string): CatalogVideo[] {
  return videoCatalog.filter((v) => v.programme === programme);
}

/** Get unique programmes from the catalog */
export function getProgrammes(): string[] {
  return [...new Set(videoCatalog.map((v) => v.programme).filter(Boolean))] as string[];
}
