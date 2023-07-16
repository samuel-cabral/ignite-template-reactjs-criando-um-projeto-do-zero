import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { useCallback, useState } from 'react';

import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Header from '../components/Header';
import { LoadMorePostsButton } from '../components/LoadMorePostsButton';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const formattedPosts = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const [posts, setPosts] = useState(formattedPosts);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);

  const handleLoadMorePosts = useCallback(async () => {
    if (nextPage === null) return;

    setIsLoadingMorePosts(true);
    try {
      const response = await fetch(nextPage);
      const data = await response.json();

      const newPosts = data.results.map((post: Post) => {
        return {
          uid: post.uid,
          first_publication_date: format(
            new Date(post.first_publication_date),
            'dd MMM yyyy',
            {
              locale: ptBR,
            }
          ),
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
        };
      });

      setPosts(oldPosts => [...oldPosts, ...newPosts]);
      setNextPage(data.next_page);
    } catch (error) {
      // console.error('Error fetching posts', error);
    } finally {
      setIsLoadingMorePosts(false);
    }
  }, [nextPage]);

  return (
    <>
      <Head>
        <title>Home | SpaceTraveling</title>
      </Head>
      <Header />
      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <time>
                    <FiCalendar />
                    {post.first_publication_date}
                  </time>
                  <span>
                    <FiUser />
                    {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>

        <div className={styles.loadMorePostsContainer}>
          {nextPage && (
            <LoadMorePostsButton
              isLoading={isLoadingMorePosts}
              onClick={handleLoadMorePosts}
            />
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const prismicClient = getPrismicClient({});

    const response = await prismicClient.getByType('post', {
      pageSize: 1,
      orderings: {
        field: 'last_publication_date',
        direction: 'desc',
      },
    });

    return {
      props: {
        postsPagination: {
          next_page: response.next_page,
          results: response.results,
        },
      },
    };
  } catch (error) {
    return {
      props: {
        postsPagination: {
          next_page: null,
          results: [],
        },
      },
    };
  }
};
