export enum Category {
  Food = 'food',
  Performance = 'performance',
  Social = 'social',
  Athletic = 'athletic',
  Academic = 'academic',
}

export type Post = {
  id: string,
  isStarred: boolean,
  author: string,
  authorID: string,
  title: string,
  start: number,
  end: number,
  post: string,
  link: string,
  latitude: number,
  longitude: number,
  postalAddress: number,
  locationDescription: string,
  category: Category,
  lastEditedTimestamp: number,
  datetimeStatus: {
    startStatus: number,
    datetime: string,
  }
}

