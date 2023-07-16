import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingMessage}>Carregando...</div>
      </div>
    );
  }

  const formattedPost = {
    ...post,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
  };

  const wordCount = formattedPost.data.content.reduce(
    (contentCount, contentItem) =>
      contentCount +
      contentItem.body.reduce(
        (bodyCount, bodyItem) => bodyCount + bodyItem.text.split(' ').length,
        0
      ),
    0
  );

  const timeToRead = Math.ceil(wordCount / 200); // assuming an average reading speed of 200 wpm

  return (
    <>
      <Head>
        <title>{formattedPost.data.title} | SpaceTraveling</title>
      </Head>

      <Header />

      <img
        className={styles.banner}
        src={formattedPost.data.banner.url}
        alt={formattedPost.data.title}
      />

      <main className={commonStyles.container}>
        <h1 className={styles.postTitle}>{formattedPost.data.title}</h1>

        <div className={styles.postInfo}>
          <time>
            <FiCalendar /> {formattedPost.first_publication_date}
          </time>
          <span>
            <FiUser /> {formattedPost.data.author}
          </span>
          <span>
            <FiClock /> {timeToRead} min
          </span>
        </div>

        {formattedPost.data.content.map(contentItem => (
          <article
            className={styles.postContent}
            key={contentItem.heading.slice(0, 10)}
          >
            <h2>{contentItem.heading}</h2>
            {contentItem.body.map(bodyItem => (
              <p key={bodyItem.text.slice(0, 10)}>{bodyItem.text}</p>
            ))}
          </article>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post');

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post', String(slug));

  return {
    props: {
      post: response,
    },
    revalidate: 1,
  };
};
