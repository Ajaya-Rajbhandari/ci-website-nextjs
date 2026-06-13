import Head from "next/head";
import Image from "next/image";
import Navbar from "../../components/Navbar.js";
import Footer from "../../components/footer/Footer.js";

import PrimaryButton from "../../components/buttons/PrimaryButton.js";
import { getCourseById, getCourseIds } from "../../lib/sanity/fetchers";

import useAuth from "../../lib/hooks/Auth.js";
import { UserService } from "../../lib/service/UserService.js";
import styles from "../../styles/courses/courses_page.module.css";

export default function CoursePage({ course }) {
  const { user, userData, registerWithEmailAndPassword } = useAuth();

  const CourseCoverImage = (props) => {};

  return (
    <div>
      <Head>
        <title> Charicha Institute | Course | {course?.title} </title>
        <meta
          name="description"
          content={"Charicha Institute - " + course?.title}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Navbar />

	<div>
        </div>

        <div className={styles.heroContainer}>
          <div className={styles.coverImageContainer}>
            <Image
              alt={"Computer Course - " + course?.title}
              src={
                course?.coverImg === undefined
                  ? "/computer_course_cover_2.jpg"
                  : course.coverImg
              }
              width="100"
              height="100"
              layout="responsive"
              objectFit="cover"
              objectPosition={"center"}
            />
          </div>
          <div className={styles.containerDivider}>
            <div className={styles.heroContentContainer}>
              <p className={styles.courseTitle}> {course?.title} </p>
              <p className={styles.courseDescription}>{course?.description}</p>
              <PrimaryButton text="Start Learning" />
            </div>
            {/* <div className={styles.heroContentContainer}> */}
            {/*   Welcome to the good night */}
            {/* </div> */}
          </div>
        </div>

        <div className={styles.detailsContainer}>
          <div>
            <p className={styles.headingTwo}> Lessons You&apos;ll learn </p>
          </div>

          <ul className={styles.lessonsContainer}>
            {course?.lessons?.map((lesson) => (
              <li key={lesson}> {lesson} </li>
            ))}
          </ul>

          {user != null ? (
            <PrimaryButton
              text="Enroll now"
              onClick={async () => {
                console.log(userData);
                UserService.updateUser(user.uid, {
                  [`courses.${course.id}`]: "",
                });
              }}
            />
          ) : (
            <PrimaryButton text="Login to enroll now"></PrimaryButton>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export async function getStaticPaths() {
  const ids = await getCourseIds();
  return {
    paths: ids.map((id) => ({ params: { id: String(id) } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const course = await getCourseById(params.id);
  if (!course) return { notFound: true };
  return { props: { course }, revalidate: 60 };
}
