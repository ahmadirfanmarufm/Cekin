"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  Clock3,
  FileImage,
  FileVideo,
  Filter,
  History,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  COMMUNITY_MEDIA_LIMITS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  getVideoDuration,
} from "@/features/community/lib/validation";
import { AuthModal } from "@/components/auth/auth-modal";

import type {
    ApiResponse,
    CommunityCategory,
    CommunityModerationLog,
    CommunityPost,
    CommunityToastData,
    CommunityToastType,
    CommunityViewer,
    ModerationVerificationStatus,
    FeedFilter,
    SortOption,
    SelectedMedia,
} from "@/features/community/types";

import {
  CATEGORIES,
  formatDate,
  getCategoryLabel,
  getVerificationConfig,
} from "@/features/community/lib/utils";

import { ModerationLogs } from "@/features/community/components/moderation-logs";
import { ModerationDialog } from "@/features/community/components/moderation-dialog";
import { CommunityToast } from "@/features/community/components/community-toast";
import { useCommunityModeration } from "@/features/community/hooks/use-community-moderation";
import { CommunityFeedSkeleton } from "./community-skeleton";

import { DeletePostDialog } from "@/features/community/components/delete-post-dialog";
import { useCommunityDelete } from "@/features/community/hooks/use-community-delete";

import { CommunityImageDialog } from "@/features/community/components/community-image-dialog";

import { PostEngagement } from "@/features/community/components/post-engagement";

const MAX_TITLE_LENGTH = 150;
const MAX_CONTENT_LENGTH = 10000;

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export const CommunityCenter = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const [selectedCategory, setSelectedCategory] = useState<CommunityCategory | "all">("all");

    const [viewer, setViewer] = useState<CommunityViewer>({
        isAuthenticated: false,
        userId: null,
        role: null
    });

    const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
    const [sortOption, setSortOption] = useState<SortOption>("newest");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

    const [form, setForm] = useState({
        category: "whatsapp-scam" as CommunityCategory,
        title: "",
        content: "",
    });

    const [toast, setToast] = useState<CommunityToastData | null>(null);

    const showToast = useCallback(
        (type: CommunityToastType, message: string) => {
            setToast({
            id: crypto.randomUUID(),
            type,
            message,
            });
        },
        [],
    );

    const closeToast = useCallback(() => {
        setToast(null);
    }, []);

    type VerificationStatus =
        | "under_review"
        | "verified"
        | "needs_info"
        | "rejected";

    const isModerator = viewer.role === "moderator" || viewer.role === "admin";

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);

            const response = await fetch("/api/community/posts", {
                method: "GET",
                cache: "no-store",
                headers: {
                    Accept: "application/json",
                },
            });

            const responseText = await response.text();

            if (!responseText.trim()) {
                throw new Error(`Server mengembalikan response kosong. HTTP ${response.status}. Periksa GET /api/community/posts.`);
            }

            let result: ApiResponse<CommunityPost[]>;

            try {
                result = JSON.parse(responseText);
            } catch {
                console.error("Invalid community API response:", responseText);

                throw new Error(`Response API bukan JSON yang valid. HTTP ${response.status}.`,);
            }

            if (!response.ok || !result.success) {
                throw new Error(result.message ??`Gagal mengambil postingan. HTTP ${response.status}.`,);
            }

            setViewer(
                result.viewer ?? {
                    isAuthenticated: false,
                    userId: null,
                    role: null,
                },
            );

            setPosts(result.data ?? []);
        } catch (error) {
            console.error("Fetch community posts error:", error);

            showToast("error", error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil postingan.",);
        } finally {
            setLoading(false);
        }
    }, []);

    const moderation = useCommunityModeration({
        onSuccess: (message) => {
            showToast("success", message);
        },
        onRefresh: fetchPosts,
    });

    const deletion = useCommunityDelete({
        onSuccess: (message) => {
            showToast("success", message);
        },
        onRefresh: fetchPosts,
    });

    useEffect(() => {
        const handleAuthChange = () => {
            void fetchPosts();
        }

        window.addEventListener(
            "cekin-auth-change",
            handleAuthChange,
        );

        return () => {
            window.removeEventListener(
            "cekin-auth-change",
            handleAuthChange,
            );
        };
    }, [fetchPosts]);

    useEffect(() => {
        void fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        if (!viewer.isAuthenticated && feedFilter === "mine") {
            setFeedFilter("all");
        }
    }, [viewer.isAuthenticated, feedFilter]);

    const filteredPosts = useMemo(() => {
        const query = deferredSearchQuery.trim().toLowerCase();

        return [...posts].filter((post) => {
            const matchesSearch = !query ||
                post.title.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query) ||
                post.author.username.toLowerCase().includes(query);

            const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;

            const matchesMine = feedFilter === "all" || post.isMine;

            return (matchesSearch && matchesCategory && matchesMine);
            })
            .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();

            return sortOption === "newest"
                ? dateB - dateA
                : dateA - dateB;
            });
    }, [posts,deferredSearchQuery,selectedCategory, feedFilter, sortOption]);

    const handleOpenCreatePost = () => {
        if (!viewer.isAuthenticated) {
            setIsAuthModalOpen(true);
            return;
        }

        setIsCreateOpen(true);
    }

    const handleMediaSelection = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);

        if (!files.length) return;

        const nextFiles = [...selectedMedia];

        for (const file of files) {
        if (nextFiles.length >= COMMUNITY_MEDIA_LIMITS.MAX_FILES) {
            showToast("info", "Maksimal 4 file media.");
            break;
        }

        const isImage = (ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type);

        const isVideo = (ALLOWED_VIDEO_TYPES as readonly string[]).includes(file.type);

        if (!isImage && !isVideo) {
            showToast("info", `Format ${file.name} tidak didukung.`);
            continue;
        }

        if (isImage && file.size > COMMUNITY_MEDIA_LIMITS.MAX_IMAGE_SIZE) {
            showToast("info", `Foto ${file.name} melebihi batas 5 MB.`);
            continue;
        }

        if (isVideo && file.size > COMMUNITY_MEDIA_LIMITS.MAX_VIDEO_SIZE) {
            showToast("info", `Video ${file.name} melebihi batas 25 MB.`);
            continue;
        }

        if (isVideo && nextFiles.some((item) => item.mediaType === "video")) {
            showToast("info", "Maksimal 1 video dalam satu postingan.");
            continue;
        }

        const totalSize = nextFiles.reduce((total, item) => total + item.file.size,0) + file.size;

        if (totalSize > COMMUNITY_MEDIA_LIMITS.MAX_TOTAL_SIZE) {
            showToast("info", "Total ukuran media tidak boleh melebihi 30 MB.",);
            continue;
        }

        nextFiles.push({
            id: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
            mediaType: isImage ? "image" : "video",
        });
        }

        setSelectedMedia(nextFiles);

        event.target.value = "";
    }

    const removeSelectedMedia = (id: string) => {
        setSelectedMedia((current) => {
        const target = current.find((item) => item.id === id);

        if (target) {
            URL.revokeObjectURL(target.previewUrl);
        }

        return current.filter((item) => item.id !== id);
        });
    }

    const clearSelectedMedia = () => {
        selectedMedia.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
        });

        setSelectedMedia([]);
    }

    const handleCreatePost = async(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const title = form.title.trim();
        const content = form.content.trim();

        if (!title || !content) {
            showToast("info", "Judul dan deskripsi wajib diisi.");
            return;
        }

        if (title.length > MAX_TITLE_LENGTH) {
            showToast("info", "Judul maksimal 150 karakter.");
            return;
        }

        if (content.length > MAX_CONTENT_LENGTH) {
            showToast("info", "Deskripsi maksimal 10.000 karakter.");
            return;
        }

        if (selectedMedia.length === 0) {
            showToast("info", "Tambahkan minimal satu foto atau video bukti.");
            return;
        }

        try {
        setSubmitting(true);

        const formData = new FormData();

        formData.append("category", form.category);
        formData.append("title", title);
        formData.append("content", content);

        let videoDuration: number | undefined;

        for (const item of selectedMedia) {
            if (item.mediaType === "video") {
            videoDuration = await getVideoDuration(item.file);

            if (
                videoDuration >
                COMMUNITY_MEDIA_LIMITS.MAX_VIDEO_DURATION
            ) {
                throw new Error(
                "Durasi video maksimal 60 detik.",
                );
            }
            }

            formData.append("media", item.file);
        }

        if (videoDuration !== undefined) {
            formData.append(
            "videoDuration",
            String(videoDuration),
            );
        }

        const response = await fetch("/api/community/posts", {
            method: "POST",
            body: formData,
        });

        const result: ApiResponse<unknown> =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message ?? "Gagal membuat postingan.");
        }

        showToast("success", "Postingan berhasil dipublikasikan.");

        setForm({
            category: "whatsapp-scam",
            title: "",
            content: "",
        });

        clearSelectedMedia();
        setIsCreateOpen(false);

        await fetchPosts();
        } catch (error) {
        console.error("Create community post:", error);

        showToast("error",
            error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat membuat postingan.",
        );
        } finally {
        setSubmitting(false);
        }
    }

    const closeCreateModal = () => {
        if (submitting) return;

        setIsCreateOpen(false);

        setForm({
        category: "whatsapp-scam",
        title: "",
        content: "",
        });

        clearSelectedMedia();
    }

    const categoryCounts = useMemo(() => {
        return posts.reduce<Record<string, number>>(
            (counts, post) => {
            counts[post.category] = (counts[post.category] ?? 0) + 1;
            return counts;
            },
            {},
        );
    }, [posts]);

    const visibleCategories = CATEGORIES.filter(
    (category) =>
        category.value === "all" ||
        category.value === "whatsapp-scam" ||
        category.value === "phishing",
    );

    const hiddenCategories = CATEGORIES.filter(
    (category) =>
        category.value !== "all" &&
        category.value !== "whatsapp-scam" &&
        category.value !== "phishing",
    );

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <div className="mb-2 flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                    <ShieldCheck size={19} />
                </div>

                <span className="text-sm font-semibold text-[var(--brand)]">
                    CEKIN Community
                </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Community
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                Berbagi informasi dan saling membantu mengenali penipuan.
                </p>
            </div>

            <button
                type="button"
                onClick={handleOpenCreatePost}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white transition duration-300 hover:bg-[var(--brand-dark)]"
            >
                <Plus size={18} />
                Buat Postingan
            </button>
            </section>

            {/* Safety notice */}
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
            <ShieldAlert
                size={19}
                className="mt-0.5 shrink-0 text-amber-700"
            />

            <p className="text-xs leading-relaxed text-amber-900 sm:text-sm">
                Jangan bagikan OTP, password, nomor rekening, alamat,
                atau informasi pribadi. Setiap laporan berstatus
                <strong> belum terverifikasi</strong> sampai diperiksa.
            </p>
            </div>

            {/* Feedback */}
            {/* Search */}
            <section className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                    <Search
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(event) =>
                        setSearchQuery(event.target.value)
                        }
                        placeholder="Cari laporan, judul, atau pengguna..."
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
                    />
                    </div>

                    <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />

                    <select
                        value={feedFilter}
                        onChange={(event) =>
                        setFeedFilter(event.target.value as FeedFilter)
                        }
                        className="h-11 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand)] sm:flex-none"
                    >
                        <option value="all">Semua postingan</option>
                        <option value="mine" disabled={!viewer.isAuthenticated}>
                        Postingan kamu {!viewer.isAuthenticated ? "(Login)" : ""}
                        </option>
                    </select>

                    <select
                        value={sortOption}
                        onChange={(event) =>
                        setSortOption(event.target.value as SortOption)
                        }
                        className="h-11 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand)] sm:flex-none"
                    >
                        <option value="newest">Terbaru</option>
                        <option value="oldest">Terlama</option>
                    </select>
                    </div>
                </div>

                {/* Category filters */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        {selectedCategory !== "all" && (
                        <button
                            type="button"
                            onClick={() => {
                            setSelectedCategory("all");
                            setIsCategoryMenuOpen(false);
                            }}
                            className="shrink-0 text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)]"
                        >
                            Reset filter
                        </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Kategori utama: selalu terlihat di mobile */}
                        {visibleCategories.map((category) => {
                        const active = selectedCategory === category.value;

                        return (
                            <button
                            key={category.value}
                            type="button"
                            onClick={() => {
                                setSelectedCategory(category.value);
                                setIsCategoryMenuOpen(false);
                            }}
                            aria-pressed={active}
                            className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition duration-200 ${
                                active
                                ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm"
                                : "border-gray-200 bg-white text-gray-600 hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-dark)]"
                            }`}
                            >
                            {category.label}

                            <span className="text-[10px] opacity-80">
                                {category.value === "all"
                                ? posts.length
                                : categoryCounts[category.value] ?? 0}
                            </span>
                            </button>
                        );
                        })}

                        {/* Kategori tambahan: desktop langsung terlihat */}
                        {hiddenCategories.map((category) => {
                        const active = selectedCategory === category.value;

                        return (
                            <button
                            key={category.value}
                            type="button"
                            onClick={() => {
                                setSelectedCategory(category.value);
                                setIsCategoryMenuOpen(false);
                            }}
                            aria-pressed={active}
                            className={`hidden min-h-9 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition duration-200 sm:inline-flex ${
                                active
                                ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm"
                                : "border-gray-200 bg-white text-gray-600 hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-dark)]"
                            }`}
                            >
                            {category.label}

                            <span className="text-[10px] opacity-80">
                                {categoryCounts[category.value] ?? 0}
                            </span>
                            </button>
                        );
                        })}

                        {/* Tombol titik tiga: hanya mobile */}
                        <div className="relative sm:hidden">
                        <button
                            type="button"
                            onClick={() =>
                            setIsCategoryMenuOpen((current) => !current)
                            }
                            aria-label="Lihat kategori lainnya"
                            aria-expanded={isCategoryMenuOpen}
                            className={`inline-flex size-9 items-center justify-center rounded-lg border transition ${
                            isCategoryMenuOpen ||
                            hiddenCategories.some(
                                (category) => category.value === selectedCategory,
                            )
                                ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <MoreHorizontal size={19} />
                        </button>

                        {/* Dropdown kategori tambahan */}
                        {isCategoryMenuOpen && (
                            <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                            <p className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Kategori lainnya
                            </p>

                            <div className="max-h-64 space-y-1 overflow-y-auto">
                                {hiddenCategories.map((category) => {
                                const active = selectedCategory === category.value;

                                return (
                                    <button
                                    key={category.value}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory(category.value);
                                        setIsCategoryMenuOpen(false);
                                    }}
                                    className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                                        active
                                        ? "bg-[var(--brand-soft)] text-[var(--brand-dark)]"
                                        : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                    >
                                    <span className="truncate">
                                        {category.label}
                                    </span>

                                    <span className="shrink-0 text-[10px] opacity-70">
                                        {categoryCounts[category.value] ?? 0}
                                    </span>
                                    </button>
                                );
                                })}
                            </div>
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Keterangan kategori yang sedang dipilih */}
                    {selectedCategory !== "all" && (
                        <p className="text-[11px] text-gray-500">
                        Filter aktif:{" "}
                        <span className="font-semibold text-[var(--brand)]">
                            {getCategoryLabel(selectedCategory)}
                        </span>
                        </p>
                    )}
                </div>
            </section>

            {/* Feed heading */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
                <h2 className="font-semibold text-gray-900">
                {feedFilter === "mine"
                    ? "Postingan kamu"
                    : "Diskusi Komunitas"}
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                {filteredPosts.length} postingan ditemukan
                </p>
            </div>

            <button
                type="button"
                onClick={() => void fetchPosts()}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--brand)] hover:text-[var(--brand-dark)] disabled:opacity-50"
            >
                <ArrowUpDown size={14} />
                Refresh
            </button>
            </div>

            {/* Feed */}
            <section className="space-y-4">
            {loading ? (
                <CommunityFeedSkeleton/>
            ) : filteredPosts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                    <MessageCircle size={23} />
                </div>

                <h3 className="font-semibold text-gray-900">
                    Belum ada postingan
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                    {feedFilter === "mine"
                    ? "Kamu belum membuat postingan."
                    : "Belum ada laporan yang sesuai dengan pencarianmu."}
                </p>

                {feedFilter === "mine" && (
                    <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="mt-4 text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)]"
                    >
                    Buat postingan pertama
                    </button>
                )}
                </div>
            ) : (
                filteredPosts.map((post) => {
                const verification = getVerificationConfig(post.verificationStatus,);
                const VerificationIcon = verification.icon;

                return(
                <article
                    key={post.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300"
                >
                    <div className="space-y-4 p-4 sm:p-5">
                    {/* Author and status */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-sm font-bold uppercase text-[var(--brand-dark)]">
                            {post.author.username.slice(0, 1)}
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900">
                                {post.author.username}
                            </p>

                            {post.isMine && (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                    Kamu
                                </span>
                            )}
                            </div>

                            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                            <Clock3 size={12} />
                            {formatDate(post.createdAt)}
                            </p>
                        </div>
                        </div>

                        <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${verification.className}`}
                        >
                            <VerificationIcon size={12} />
                            {verification.label}
                        </span>
                    </div>

                    {/* Category */}
                    <div>
                        <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                        {getCategoryLabel(post.category)}
                        </span>
                    </div>

                    {/* Content */}
                    <div>
                        <h3 className="text-base font-bold leading-snug text-gray-900">
                        {post.title}
                        </h3>

                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-600">
                        {post.content}
                        </p>
                    </div>

                    {/* Media */}
                    {post.media.length > 0 && (
                        <div
                            className={`grid gap-2 ${
                            post.media.length === 1
                                ? "grid-cols-1"
                                : "grid-cols-2"
                            }`}
                        >
                            {post.media.map((media) => (
                            <div
                                key={media.id}
                                className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                            >
                                {media.url ? (
                                media.mediaType === "video" ? (
                                    <video
                                    src={media.url}
                                    controls
                                    preload="metadata"
                                    className="max-h-[420px] w-full bg-black object-contain"
                                    />
                                ) : (
                                    <button
                                    type="button"
                                    onClick={() => setPreviewImage(media.url)}
                                    aria-label="Perbesar foto bukti laporan"
                                    className="group block w-full cursor-zoom-in"
                                    >
                                    <img
                                        src={media.url}
                                        alt="Bukti laporan"
                                        loading="lazy"
                                        className="max-h-[420px] w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                                    />

                                    {/* Zoom indicator */}
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition duration-200 group-hover:bg-black/10">
                                        <div className="flex size-10 scale-90 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition duration-200 group-hover:scale-100 group-hover:opacity-100">
                                        <Search size={19} />
                                        </div>
                                    </div>
                                    </button>
                                )
                                ) : (
                                <div className="flex min-h-32 items-center justify-center gap-2 text-xs text-gray-400">
                                    <AlertCircle size={16} />
                                    Media tidak dapat dimuat
                                </div>
                                )}
                            </div>
                            ))}
                        </div>
                    )}


                    {/* Footer */}
                    <div className="space-y-3 border-t border-gray-100 pt-3">
                        <PostEngagement
                            post={post}
                            viewer={viewer}
                            isModerator={isModerator}
                            onRequireLogin={() => setIsAuthModalOpen(true)}
                            onPreviewImage={setPreviewImage}
                            notify={showToast}
                        />

                        {(isModerator || post.isMine) && (
                            <div className="flex flex-wrap items-center gap-2">
                            {isModerator && (
                                <>
                                <button
                                    type="button"
                                    onClick={() => void moderation.handleOpenModerationLogs(post)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                                >
                                    <History size={14} />
                                    Riwayat
                                </button>

                                <button
                                    type="button"
                                    onClick={() => moderation.handleOpenModeration(post)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--brand)] px-3 py-2 text-xs font-semibold text-[var(--brand)] transition hover:bg-[var(--brand-soft)]"
                                >
                                    <ShieldCheck size={14} />
                                    Tinjau Laporan
                                </button>
                                </>
                            )}

                            <button
                                type="button"
                                onClick={() => deletion.handleOpenDelete(post)}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                            >
                                <Trash2 size={14} />
                                Hapus
                            </button>
                            </div>
                        )}
                    </div>
                    </div>
                </article>
                )})
            )}
            </section>

            {/* Create post modal */}
            {isCreateOpen && (
            <div
                className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    closeCreateModal();
                }
                }}
            >
                <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
                {/* Modal header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
                    <div>
                    <h2 className="font-bold text-gray-900">
                        Buat Postingan
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                        Bagikan informasi atau bukti penipuan.
                    </p>
                    </div>

                    <button
                    type="button"
                    onClick={closeCreateModal}
                    disabled={submitting}
                    className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Tutup"
                    >
                    <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleCreatePost}
                    className="space-y-5 p-5"
                >
                    {/* Category */}
                    <div className="space-y-2">
                    <label
                        htmlFor="community-category"
                        className="text-sm font-semibold text-gray-800"
                    >
                        Kategori
                    </label>

                    <select
                        id="community-category"
                        value={form.category}
                        onChange={(event) =>
                        setForm((current) => ({
                            ...current,
                            category: event.target.value as CommunityCategory,
                        }))
                        }
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
                    >
                        {CATEGORIES.filter(
                        (item) => item.value !== "all",
                        ).map((category) => (
                        <option
                            key={category.value}
                            value={category.value}
                        >
                            {category.label}
                        </option>
                        ))}
                    </select>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label
                        htmlFor="community-title"
                        className="text-sm font-semibold text-gray-800"
                        >
                        Judul laporan
                        </label>

                        <span className="text-xs text-gray-400">
                        {form.title.length}/{MAX_TITLE_LENGTH}
                        </span>
                    </div>

                    <input
                        id="community-title"
                        type="text"
                        maxLength={MAX_TITLE_LENGTH}
                        value={form.title}
                        onChange={(event) =>
                        setForm((current) => ({
                            ...current,
                            title: event.target.value,
                        }))
                        }
                        placeholder="Contoh: Modus penipuan mengatasnamakan kurir"
                        required
                        className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
                    />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label
                        htmlFor="community-content"
                        className="text-sm font-semibold text-gray-800"
                        >
                        Kronologi
                        </label>

                        <span className="text-xs text-gray-400">
                        {form.content.length.toLocaleString("id-ID")}/
                        {MAX_CONTENT_LENGTH.toLocaleString("id-ID")}
                        </span>
                    </div>

                    <textarea
                        id="community-content"
                        value={form.content}
                        onChange={(event) =>
                        setForm((current) => ({
                            ...current,
                            content: event.target.value,
                        }))
                        }
                        maxLength={MAX_CONTENT_LENGTH}
                        rows={5}
                        required
                        placeholder="Ceritakan apa yang terjadi, bagaimana kamu menerima pesan atau tawaran tersebut, dan hal mencurigakan yang kamu temukan..."
                        className="w-full resize-y rounded-xl border border-gray-200 p-3 text-sm leading-relaxed outline-none transition placeholder:text-gray-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
                    />
                    </div>

                    {/* Media upload */}
                    <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-800">
                        Bukti pendukung
                        </label>

                        <span className="text-xs text-gray-400">
                        {selectedMedia.length}/
                        {COMMUNITY_MEDIA_LIMITS.MAX_FILES} file
                        </span>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                        multiple
                        onChange={handleMediaSelection}
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={
                        selectedMedia.length >=
                        COMMUNITY_MEDIA_LIMITS.MAX_FILES
                        }
                        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-7 text-center transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                        <Upload size={20} />
                        </div>

                        <div>
                        <p className="text-sm font-semibold text-gray-800">
                            Pilih foto atau video
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            JPEG, PNG, WebP, MP4, WebM, MOV
                        </p>
                        </div>
                    </button>

                    {/* Media limits */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 sm:grid-cols-4">
                        <span className="rounded-lg bg-gray-50 p-2">
                        Foto maks. 5 MB
                        </span>

                        <span className="rounded-lg bg-gray-50 p-2">
                        Video maks. 25 MB
                        </span>

                        <span className="rounded-lg bg-gray-50 p-2">
                        Video maks. 60 detik
                        </span>

                        <span className="rounded-lg bg-gray-50 p-2">
                        Total maks. 30 MB
                        </span>
                    </div>

                    {/* Selected media previews */}
                    {selectedMedia.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {selectedMedia.map((item) => (
                            <div
                            key={item.id}
                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                            >
                            {item.mediaType === "image" ? (
                                <img
                                src={item.previewUrl}
                                alt={item.file.name}
                                className="aspect-square w-full object-cover"
                                />
                            ) : (
                                <video
                                src={item.previewUrl}
                                className="aspect-square w-full bg-black object-contain"
                                controls
                                />
                            )}

                            <div className="space-y-1 p-2">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                {item.mediaType === "image" ? (
                                    <FileImage size={13} />
                                ) : (
                                    <FileVideo size={13} />
                                )}

                                <span className="truncate text-[10px] font-medium">
                                    {item.file.name}
                                </span>
                                </div>

                                <p className="text-[10px] text-gray-400">
                                {formatFileSize(item.file.size)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                removeSelectedMedia(item.id)
                                }
                                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-600"
                                aria-label={`Hapus ${item.file.name}`}
                            >
                                <Trash2 size={14} />
                            </button>
                            </div>
                        ))}
                        </div>
                    )}
                    </div>

                    {/* Privacy notice */}
                    <div className="flex gap-2 rounded-xl bg-amber-50 p-3">
                    <ShieldAlert
                        size={17}
                        className="mt-0.5 shrink-0 text-amber-700"
                    />

                    <p className="text-xs leading-relaxed text-amber-900">
                        Pastikan bukti tidak menampilkan OTP, password,
                        nomor rekening, alamat, atau informasi pribadi
                        orang lain. Status laporan akan dimulai sebagai
                        belum terverifikasi.
                    </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={closeCreateModal}
                        disabled={submitting}
                        className="h-11 rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? (
                        <>
                            <LoaderCircle
                            size={17}
                            className="animate-spin"
                            />
                            Mengunggah...
                        </>
                        ) : (
                        <>
                            <Plus size={17} />
                            Publikasikan
                        </>
                        )}
                    </button>
                    </div>
                </form>
                </div>
            </div>
        )}

        {/* Moderation dialog */}
        <ModerationDialog
            post={moderation.moderationTarget}
            status={moderation.moderationStatus}
            note={moderation.moderationNote}
            submitting={moderation.moderationSubmitting}
            error={moderation.moderationError}
            onStatusChange={moderation.setModerationStatus}
            onNoteChange={moderation.setModerationNote}
            onSubmit={moderation.handleUpdateVerification}
            onClose={moderation.handleCloseModeration}
        />

        {/* Moderation logs */}
        <ModerationLogs
            post={moderation.moderationLogTarget}
            logs={moderation.moderationLogs}
            loading={moderation.moderationLogsLoading}
            error={moderation.moderationLogsError}
            onClose={moderation.handleCloseModerationLogs}
            onRetry={() => {
                if (moderation.moderationLogTarget) {
                void moderation.handleOpenModerationLogs(
                    moderation.moderationLogTarget,
                );
                }
            }}
        />

        {/* Delete Post Dialog */}
        {deletion.deleteTarget && (
            <DeletePostDialog
                postTitle={deletion.deleteTarget.title}
                submitting={deletion.deleteSubmitting}
                error={deletion.deleteError}
                onConfirm={deletion.handleDeletePost}
                onClose={deletion.handleCloseDelete}
            />
        )}

        {/* Community Image Preview */}
        <CommunityImageDialog
            imageUrl={previewImage}
            onClose={() => setPreviewImage(null)}
        />

        {/* Toast */}
        <CommunityToast
            toast={toast}
            onClose={closeToast}
        />

        {/* Auth */}
        <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            initialMode="login"
        />
    </div>
  );
}