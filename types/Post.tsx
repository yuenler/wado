export enum Category {
  Food = 'food',
  Performance = 'performance',
  Social = 'social',
  Athletic = 'athletic',
  Academic = 'academic',
}

export type Post = (
  {
  author: string,
  authorID: string,
  title: string,
  start: number,
  end: number,
  post: string,
  link: string,
  latitude: number,
  longitude: number,
  postalAddress: string,
  locationDescription: string,
  category: Category,
  lastEditedTimestamp: number,
  targetedHouses: string[],
  targetedYears: string[],
}
);

export type UserSpecificPost = (
  Post
    &
    (
      {
        id: string,
        isArchived: boolean,
        isOwnPost: boolean,
      }
      &
      ({
        isStarred: true,
        pushIdentifier: string,
      }
      | {
        isStarred: false
      })
    )
)

export type LiveUserSpecificPost = (
  UserSpecificPost
    &
    (
    {
      datetimeStatus: {
        startStatus: number,
        datetime: string,
      }
    }
    )
)
