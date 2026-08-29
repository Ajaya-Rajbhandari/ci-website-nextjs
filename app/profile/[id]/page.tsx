import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Charicha Institute',
  description: 'Charicha Institute Profile'
};

import Link from 'next/link';
import Image from 'next/image';

import { FaFacebook, FaInstagram, FaDotCircle } from "react-icons/fa";
import { AiFillHeart } from "react-icons/ai";
import { ImProfile } from "react-icons/im";
import { BsRecordCircleFill } from "react-icons/bs";

import { MdOutlineAccessTimeFilled } from "react-icons/md";
import Navbar from "../../../components/Navbar";
import styles from "../../../styles/profile/profile.module.css";
import Marginer from "../../../components/utils/Marginer";
import Footer from "../../../components/footer/Footer";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { coursesList } from "../../../components/course/coursesList";

import { UserService } from '../../../lib/service/UserService';
import type { UserData } from '../../../types';

function ProfileView({ userData, error }: { userData?: UserData | null; error?: string | null }) {
  const loadingUser = !userData;
  const isError = error;
  const userJoinedDate = new Date(userData?.joined_at ?? 0);

  const Roles = () =>
    loadingUser ? (
      <Skeleton width={20} />
    ) : userData?.roles?.length ? (
      Object.keys(userData?.roles).map((key) => (
        <div key={key} className={styles.roleCard}>
          {key}
        </div>
      ))
    ) : (
      <p>No Roles</p>
    );

  const CoverImage = () =>
    loadingUser ? (
      <div className={styles.coverImg}>
        <Skeleton style={{ height: "200px", zIndex: "-10" }} />
      </div>
    ) : (
      <Image
        alt="cover image"
        src="/landing_image.jpg"
        className={`${styles.coverImg} w-full h-auto`}
        width={1200}
        height={200}
      />
    );

  const ProfileImage = () =>
    loadingUser ? (
      <Skeleton circle={true} width={100} height={100} />
    ) : userData?.profile_URL == "" ? (
      <div className={styles.profileTextImg}>
        <p> {userData?.first_name?.[0]} </p>{" "}
      </div>
    ) : (
      <Image
        alt=""
        src={userData?.profile_URL ?? "/profile.jpg"}
        className={styles.profileImg}
        width={200}
        height={200}
      />
    );

  const UserInfo = () =>
    loadingUser ? (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Skeleton count={1} width={320} height={20} />
        <Marginer />
        <Skeleton count={1} width={320} height={15} />
      </div>
    ) : (
      <div className={styles.userTextInfoContainer}>
        <p className={styles.titleText}>
          {!isError ? (
            userData?.first_name + " " + userData?.last_name
          ) : (
            <Skeleton />
          )}
        </p>
        <p className={styles.subTitleText}> {(userData as { rank?: string } | null | undefined)?.rank} </p>
        <p className={styles.subTitleText}>
          Since
          {!isError ? (
            userJoinedDate?.toDateString()
          ) : (
            <Skeleton width={80} />
          )}
        </p>
      </div>
    );

  const StatsInfo = () =>
    loadingUser ? (
      <Skeleton count={4} width={320} style={{ marginBottom: "10px" }} />
    ) : (
      <div className={styles.statsContainer}>
        <div className={styles.levelXpContainer}>
          <p className={styles.titleText} style={{ color: "greenyellow" }}>
            {" "}
            Gold{" "}
          </p>
          <p className={styles.subTitleText}> 314 XP </p>
        </div>
        <Marginer vertical="4px" />
        <div className={styles.levelBarContainer}>
          <div className={styles.levelHolder}></div>
          <div className={styles.completedLevel}></div>
        </div>
        <p className={styles.subTitleText}> To Platinum - 586 XP </p>
        <Marginer vertical="4px" />
        <div className={styles.heartsContainer}>
          <AiFillHeart color="red" />
          <Marginer horizontal="5px" />
          <p className={styles.subTitleText}>
            {" "}
            {userData?.hearts} Hearts{" "}
          </p>{" "}
        </div>
        <Marginer vertical="10px" />
        <div className={styles.rolesContainer}>
          <Roles />
        </div>
      </div>
    );

  const CoursesEnrolled = () => {
    return loadingUser ? (
      <Skeleton count={3} width={320} />
    ) : (
      <div>
        {Object.keys(userData?.courses).map((courseId) => {
          return (
            <div
              key={courseId}
              className={styles.roleCard}
              style={{ marginBottom: "10px" }}
            >
              <p
                className={styles.subTitleText}
                style={{
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <BsRecordCircleFill />
                <Marginer />
                {coursesList[Number(courseId)]?.title}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const SecondaryStatsInfo = () =>
    loadingUser ? (
      <Skeleton count={3} width={320} style={{ marginBottom: "10px" }} />
    ) : (
      <div className={styles.statsContainer}>
        <div className={styles.rowCenterContainer}>
          <ImProfile size={20} />
          <Marginer />
          <p className={styles.subTitleText}> 100 Profile Visits </p>
        </div>
        <Marginer />
        <div className={styles.rowCenterContainer}>
          <MdOutlineAccessTimeFilled size={20} />
          <Marginer />
          <p className={styles.subTitleText}> 1d 23h Time Spent </p>
        </div>
        <Marginer />
        <div>
          <p className={styles.titleText}> Courses Enrolled </p>
          <Marginer />
          <CoursesEnrolled />
        </div>
      </div>
    );

  const BioInfo = () =>
    loadingUser ? (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Skeleton count={1} width={320} style={{ marginBottom: "10px" }} />
        <Skeleton count={1} width={320} height={100} />
      </div>
    ) : (
      <div className={styles.statsContainer}>
        <h2 className={styles.titleText}> Bio </h2>
        <p className={styles.subTitleText}>
          Typical pop culture geek. Coffee lover. Music enthusiast. Social media
          junkie. Extreme food advocate. Tv practitioner.
        </p>
      </div>
    );

  return (
    <div>


      <main className={'bg-gradient-[-45deg] from-eggblue to-slategray'}>
        <Navbar />
        {isError && <div className='min-h-[85vh] h-full w-full flex justify-center items-center'>
		      <div>
		        <p className='text-[40px] text-white'> ERROR 404 : USER NOT FOUND </p>
                        <Link href='/' className='text-white font-light hover:text-aquamarine'> Go to Home </Link>                        
                      </div>
                    </div>}
        {!isError && (
          <>
            <CoverImage />
            <div className={styles.profileContainer}>
              <div className={styles.basicInfoContainer}>
                <ProfileImage />
                <Marginer horizontal="10px" />
                <UserInfo />
              </div>
              <div className={styles.socialMediaLinks}>
                <p className={styles.subTitleText}> Social Media </p>
                <Marginer horizontal="10px" />
                <FaFacebook size="24px" color="blue" />
                <Marginer horizontal="10px" />
                <FaInstagram size="24px" color="red" />
              </div>
            </div>

            <div className={styles.wrapContainer}>
              <StatsInfo />
              <SecondaryStatsInfo />
              <BioInfo />
            </div>

            {/* <Editor/> */}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}






// getStaticPaths returned no paths with fallback:"blocking"; the App Router
// equivalent is an empty generateStaticParams with dynamicParams left on.
export async function generateStaticParams() {
  return [];
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Resolve the data first: JSX built inside a try/catch would not have its
  // render errors caught anyway, and React lint rightly flags that.
  let userData = null;
  try {
    const user = await UserService.getUser(id);
    userData = user.userData;
  } catch {
    userData = null;
  }

  return <ProfileView userData={userData} />;
}
