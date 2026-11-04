
export type CommunityCategory =
  | "whatsapp-scam"
  | "phishing"
  | "marketplace-scam"
  | "investment-scam"
  | "job-scam"
  | "fake-giveaway"
  | "fake-account"
  | "other";

export type VerificationStatus =
  | "unverified"
  | "under_review"
  | "verified"
  | "needs_info"
  | "rejected";

export type ModerationVerificationStatus =
  | "under_review"
  | "verified"
  | "needs_info"
  | "rejected";

export type FeedFilter = "all" | "mine";

export type SortOption = "recommended" | "newest" | "oldest";

export type SelectedMedia = {
    id: string;
    file: File;
    previewUrl: string;
    mediaType: "image" | "video";
    };

export type CommunityMedia = {
    id: string;
    postId: string;
    mediaType: "image" | "video";
    mimeType: string;
    fileSize: number;
    duration: number | null;
    position: number;
    url: string | null;
};

export type CommunityPost = {
    id: string;
    category: CommunityCategory;
    title: string;
    content: string;
    status: string;
    verificationStatus: string;
    createdAt: string;
    updatedAt: string;

    author: {
        id: string;
        username: string;
    };

    media: CommunityMedia[];

    reactions: {
        total: number;
        hasReacted: boolean;
    };

    commentCount: number;
    isMine: boolean;
};

export type CommunityViewer = {
    isAuthenticated: boolean;
    userId: string | null;
    role: string | null;
};

export type CommunityModerationLog = {
    id: string;
    postId: string;
    previousVerificationStatus: string | null;
    newVerificationStatus: string;
    note: string | null;
    createdAt: string;
    moderatorId: string | null;
    moderatorUsername: string | null;
};

export type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
    viewer?: CommunityViewer;
};

export type CommunityToastType = "success" | "error" | "info";

export type CommunityToastData = {
    id: string;
    type: CommunityToastType;
    message: string;
};

export type CommentMediaKind = "image" | "video" | "gif";

export type CommunityCommentMedia = {
  id: string;
  mediaType: CommentMediaKind;
  mimeType: string;
  duration: number | null;
  url: string | null;
};

export type LikeState = {
  total: number;
  hasLiked: boolean;
};

export type CommunityComment = {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  isDeleted: boolean;
  isMine: boolean;
  isPostAuthor: boolean;
  author: {
    id: string;
    username: string;
  };
  likes: LikeState;
  media: CommunityCommentMedia | null;
};

export type GifItem = {
  id: string;
  title: string;
  previewUrl: string;
  url: string;
};
