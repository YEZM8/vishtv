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
  },
  "trendingVideos": *[_type == "video" && trendingScore > 0] | order(trendingScore desc) [0...12] {
    _id, title, youtubeId, thumbnailUrl, trendingScore, weeklyViews, "programmeTitle": programme->title
  },
  "topVideos": *[_type == "video" && viewCount > 0] | order(viewCount desc) [0...12] {
    _id, title, youtubeId, thumbnailUrl, viewCount, "programmeTitle": programme->title
  },
  "trendingNews": *[_type == "article" && weeklyViews > 0] | order(weeklyViews desc) [0...8] {
    _id, title, "slug": slug.current, featuredImage, publishedAt, weeklyViews, "categoryTitle": category->title
  },
  "topNews": *[_type == "article" && viewCount > 0] | order(viewCount desc) [0...8] {
    _id, title, "slug": slug.current, featuredImage, publishedAt, viewCount, "categoryTitle": category->title
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

/** Browse page: all programmes with categories + flat video list */
export const browsePageQuery = `{
  "programmes": *[_type == "programme" && isActive == true] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    poster,
    thumbnail,
    description,
    "categoryTitle": category->title,
    "categorySlug": category->slug.current,
    "videoCount": count(*[_type == "video" && programme._ref == ^._id]),
    "sampleVideoId": *[_type == "video" && programme._ref == ^._id] | order(publishedAt desc)[0].youtubeId
  },
  "categories": *[_type == "category"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    icon
  },
  "allVideos": *[_type == "video"] | order(publishedAt desc) [0...2000] {
    _id,
    title,
    youtubeId,
    thumbnailUrl,
    publishedAt,
    "programmeTitle": programme->title
  },
  "totalVideoCount": count(*[_type == "video"])
}`;

/** News listing, optionally filtered by category slug (pass $category = null for all) */
export const newsListFilteredQuery = `*[_type == "article" && (!defined($category) || category->slug.current == $category)] | order(publishedAt desc) [$start...$end] {
  _id,
  title,
  "slug": slug.current,
  featuredImage,
  publishedAt,
  author,
  "categoryTitle": category->title,
  "excerpt": pt::text(body[0...1])
}`;

/** Categories that have at least one article (for the news filter bar) */
export const newsCategoriesQuery = `*[_type == "category" && count(*[_type == "article" && references(^._id)]) > 0] {
  "title": title,
  "slug": slug.current,
  "count": count(*[_type == "article" && references(^._id)])
} | order(count desc)`;

/** Single news article + related articles in the same category */
export const articleQuery = `*[_type == "article" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  featuredImage,
  body,
  publishedAt,
  author,
  language,
  "categoryTitle": category->title,
  "related": *[_type == "article" && _id != ^._id && defined(^.category._ref) && category._ref == ^.category._ref] | order(publishedAt desc) [0...4] {
    _id,
    title,
    "slug": slug.current,
    featuredImage,
    publishedAt,
    "categoryTitle": category->title
  }
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

/** Sitemap: all indexable slugs/ids with last-modified dates */
export const sitemapQuery = `{
  "articles": *[_type == "article" && defined(slug.current)] {
    "slug": slug.current,
    "updated": coalesce(_updatedAt, publishedAt)
  },
  "programmes": *[_type == "programme" && isActive == true && defined(slug.current)] {
    "slug": slug.current,
    "updated": _updatedAt
  },
  "videos": *[_type == "video" && defined(youtubeId)] {
    "id": youtubeId,
    "updated": coalesce(_updatedAt, publishedAt)
  }
}`;

/** Site-wide search across articles, videos and programmes. Pass $q as "<term>*". */
export const searchQuery = `{
  "articles": *[_type == "article" && (title match $q || pt::text(body) match $q)] | order(publishedAt desc) [0...24] {
    _id,
    title,
    "slug": slug.current,
    featuredImage,
    publishedAt,
    "categoryTitle": category->title
  },
  "videos": *[_type == "video" && (title match $q || description match $q)] | order(publishedAt desc) [0...24] {
    _id,
    title,
    youtubeId,
    thumbnailUrl,
    publishedAt
  },
  "programmes": *[_type == "programme" && isActive == true && (title match $q || description match $q)] | order(title asc) [0...24] {
    _id,
    title,
    "slug": slug.current,
    poster,
    thumbnail
  }
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
