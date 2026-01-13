export interface Movie {
    id?: number;
    title: string;
    upcNumber: string;
    formats: string[];
    collections: string[];
    condition: string;
    rating: number;
    review: string;
    year: number;
    genres: string[];
    posterPath: string;
    productPosterPath: string;
    hdDriveNumber: number;
    shelfNumber: number;
    shelfSection: string;
    isOnPlex: boolean;
    createdAt?: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  genre_ids: number[];
}

export interface CollectionListItem {
  id?: number;
  collectionId: number;
  title: string;
  year: number;
  tmdbId?: number;
  createdAt?: string;
}