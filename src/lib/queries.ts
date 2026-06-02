/**
 * GROQ queries for fetching content from Sanity
 */

/** Home page: hero settings + content rows */
export const homePageQuery = `{
  "settings": *[_type == "siteSettings"][0] {
    liveStreamVideoId,
    heroHeadline,
    heroSubline,
    announcementBar
  },
  "featuredVideos": *[_type == "video" && isFeatured == true] | order(publishedAt desc) [0...10] {
    _id,
    title,
    youtubeId,
    thumbnailUrl,
    publishedAt,
    "categoryTitle": category->title,
    "programmeTitle": programme->title
  },
  "recentVideos": *[_type == "video"] | order(publishedAt desc) [0...20] {
    _id,
    title,
    youtubeId,
    thumbnailUrl,
    publishedAt,
    "categoryTitle": category->title,
    "programmeTitle": programme->title,
    "programmeSlug": programme->slug.current
  },
  "recentNews": *[_type == "article"] | order(publishedAt desc) [0...8] {
    _id,
    title,
    "slug": slug.current,
    featuredImage,
    publishedAt,
    "categoryTitle": category->title
  },
  "programmes": *[_type == "programme" && isActive == true] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    poster,
    thumbnail,
    "categoryTitle": category->title
  },
  "schedule": *[_type == "schedule" && date == now()] [0] {
    date,
    slots[] {
      time,
      episodeTitle,
      isLive,
      "programmeTitle": programme->title
    }
  }
}`;

/** Watch page: single video + related content */
export const watchPageQuery = `*[_type == "video" && youtubeId == $videoId][0] {
  _id,
  title,
  youtubeId,
  description,
  thumbnailUrl,
  publishedAt,
  "categoryTitle": category->title,
  "programme": programme-> {
    title,
    "slug": slug.current,
    description
  },
  "relatedVideos": *[_type == "video" && programme._ref == ^.programme._ref && _id != ^._id] | order(publishedAt desc) [0...10] {
    _id,
    title,
    youtubeId,
    thumbnailUrl,
    publishedAt
  }
}`;

/** Browse page: all programmes with categories */
export const browsePageQuery = `{
  "programmes": *[_type == "programme" && isActive == true] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    poster,
    thumbnail,
    description,
    "categoryTitle": category->title,
    "categorySlug": category->slug.current
  },
  "categories": *[_type == "category"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    icon
  }
}`;

/** News listing page */
export const newsListQuery = `*[_type == "article"] | order(publishedAt desc) [$start...$end] {
  _id,
  title,
  "slug": slug.current,
  featuredImage,
  publishedAt,
  author,
  "categoryTitle": category->title,
  "excerpt": pt::text(body[0...1])
}`;

/** Single news article */
export const articleQuery = `*[_type == "article" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  featuredImage,
  body,
  publishedAt,
  author,
  language,
  "categoryTitle": category->title
}`;

/** Programme detail page */
export const programmeQuery = `*[_type == "programme" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  poster,
  thumbnail,
  description,
  "categoryTitle": category->title,
  "episodes": *[_type == "video" && programme._ref == ^._id] | order(publishedAt desc) {
    _id,
    title,
    youtubeId,
    thumbnailUrl,
    publishedAt,
    description
  }
}`;

/** Events page */
export const eventsQuery = `*[_type == "event" && isActive == true] | order(date asc) {
  _id,
  title,
  image,
  date,
  ticketUrl,
  description
}`;

/** Site settings (used by layout/topbar/footer) */
export const siteSettingsQuery = `*[_type == "siteSettings"][0] {
  liveStreamVideoId,
  radioStreamUrl,
  heroHeadline,
  heroSubline,
  contactEmail,
  contactPhone,
  socialLinks,
  announcementBar
}`;
