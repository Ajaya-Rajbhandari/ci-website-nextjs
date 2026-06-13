import groq from 'groq';

// Projections are shaped to match the legacy hardcoded objects exactly, so the
// existing components (CourseCard, ServiceCard, course detail page) need no
// changes. `coverImg` coalesces to a local /public asset when no image is set.

export const coursesQuery = groq`
  *[_type == "course"] | order(order asc) {
    "id": courseId,
    level,
    title,
    "coverImg": coalesce(coverImage.asset->url, "/george.jpg"),
    lessons,
    description,
    "time": durationDays
  }
`;

export const courseByIdQuery = groq`
  *[_type == "course" && courseId == $id][0] {
    "id": courseId,
    level,
    title,
    "coverImg": coalesce(coverImage.asset->url, "/george.jpg"),
    lessons,
    description,
    "time": durationDays
  }
`;

export const courseIdsQuery = groq`*[_type == "course" && defined(courseId)].courseId`;

export const servicesQuery = groq`
  *[_type == "service"] | order(order asc) {
    title,
    description
  }
`;
