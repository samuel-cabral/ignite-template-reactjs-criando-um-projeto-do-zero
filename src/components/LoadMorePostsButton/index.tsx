import { ButtonHTMLAttributes } from 'react';

import styles from './styles.module.scss';

interface LoadMorePostsButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
}

export function LoadMorePostsButton({
  isLoading,
  ...rest
}: LoadMorePostsButtonProps) {
  if (isLoading) {
    return <div className={styles.loader} />;
  }

  return (
    <button type="button" className={styles.loadMorePosts} {...rest}>
      Carregar mais posts
    </button>
  );
}
