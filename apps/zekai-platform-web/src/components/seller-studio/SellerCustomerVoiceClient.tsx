"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  Star,
  CheckCircle2,
  Pencil,
  X,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import {
  getCustomerVoice,
  generateCustomerVoice,
  updateReplyDraft,
  publishReplyDraft,
  updateFaqDraft,
  publishFaqDraft,
  type CustomerVoiceReplyDraft,
  type CustomerVoiceFaqDraft,
} from "@/lib/api/seller";

const SENTIMENT_LABELS: Record<string, { label: string; color: string }> = {
  positive: { label: "Olumlu", color: "text-green-600 bg-green-500/10" },
  negative: { label: "Olumsuz", color: "text-red-500 bg-red-500/10" },
  mixed: { label: "Karışık", color: "text-amber-500 bg-amber-500/10" },
};

const ISSUE_LABELS: Record<string, string> = {
  kargo: "Kargo",
  urun_kalitesi: "Ürün Kalitesi",
  kurulum: "Kurulum",
  kullanim: "Kullanım",
  fiyat: "Fiyat",
  diger: "Diğer",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Taslak", color: "text-amber-600 bg-amber-500/10" },
  approved: { label: "Onaylandı", color: "text-blue-600 bg-blue-500/10" },
  published: { label: "Yayında", color: "text-green-600 bg-green-500/10" },
  rejected: { label: "Reddedildi", color: "text-red-500 bg-red-500/10" },
};

const CATEGORY_LABELS: Record<string, string> = {
  kurulum: "Kurulum",
  kullanim: "Kullanım",
  sarj: "Şarj",
  kablo: "Kablo",
  garanti: "Garanti",
  boyut: "Boyut",
  diger: "Diğer",
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function ReplyDraftCard({
  draft,
  productId,
}: {
  draft: CustomerVoiceReplyDraft;
  productId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(draft.suggestedReply);
  const qc = useQueryClient();

  const updateMut = useMutation({
    mutationFn: () => updateReplyDraft(draft.id, editText),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-voice", productId] });
      setEditing(false);
    },
    onError: (e: Error) => alert(`Güncelleme başarısız: ${e.message}`),
  });

  const publishMut = useMutation({
    mutationFn: () => publishReplyDraft(draft.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer-voice", productId] }),
    onError: (e: Error) => alert(`Yayınlama başarısız: ${e.message}`),
  });

  const sentiment = SENTIMENT_LABELS[draft.sentiment] ?? SENTIMENT_LABELS.mixed;
  const status = STATUS_LABELS[draft.status] ?? STATUS_LABELS.draft;
  const isPublished = draft.status === "published";

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Review header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
          {draft.authorName[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{draft.authorName}</span>
            <StarRow rating={draft.rating} />
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${sentiment.color}`}>
              {sentiment.label}
            </span>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${status.color}`}>
              {status.label}
            </span>
            {draft.issueType && draft.issueType !== "diger" && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {ISSUE_LABELS[draft.issueType] ?? draft.issueType}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{draft.reviewText}</p>
        </div>
      </div>

      {/* Reply draft area */}
      {draft.needsReply && (
        <div className="border-t border-border bg-muted/30 p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Yanıt Taslağı
          </p>
          {editing ? (
            <div className="space-y-2">
              <textarea
                className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
                rows={4}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => updateMut.mutate()}
                  disabled={updateMut.isPending || !editText.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {updateMut.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                  Kaydet
                </button>
                <button
                  onClick={() => { setEditing(false); setEditText(draft.suggestedReply); }}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-foreground">{draft.suggestedReply || <span className="italic text-muted-foreground">Yanıt taslağı yok</span>}</p>
              {!isPublished && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => publishMut.mutate()}
                    disabled={publishMut.isPending || !draft.suggestedReply.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {publishMut.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                    Yayınla
                  </button>
                </div>
              )}
              {isPublished && (
                <p className="mt-2 text-[11px] text-green-600">
                  Yayınlandı — {draft.publishedAt ? new Date(draft.publishedAt).toLocaleDateString("tr-TR") : ""}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {!draft.needsReply && (
        <div className="border-t border-border bg-muted/20 px-4 py-2">
          <p className="text-[11px] text-muted-foreground italic">Bu yorum için yanıt gerekli değil.</p>
        </div>
      )}
    </div>
  );
}

function FaqDraftCard({
  faq,
  index,
  productId,
}: {
  faq: CustomerVoiceFaqDraft;
  index: number;
  productId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [editQ, setEditQ] = useState(faq.question);
  const [editA, setEditA] = useState(faq.answer);
  const qc = useQueryClient();

  const updateMut = useMutation({
    mutationFn: () => updateFaqDraft(faq.id, editQ, editA),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-voice", productId] });
      setEditing(false);
    },
    onError: (e: Error) => alert(`Güncelleme başarısız: ${e.message}`),
  });

  const publishMut = useMutation({
    mutationFn: () => publishFaqDraft(faq.id, index),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer-voice", productId] }),
    onError: (e: Error) => alert(`Yayınlama başarısız: ${e.message}`),
  });

  const status = STATUS_LABELS[faq.status] ?? STATUS_LABELS.draft;
  const isPublished = faq.status === "published";

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600">
            S
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${status.color}`}>
                {status.label}
              </span>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {CATEGORY_LABELS[faq.categoryTag] ?? faq.categoryTag}
              </span>
            </div>
            {editing ? (
              <div className="space-y-2">
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                  value={editQ}
                  onChange={(e) => setEditQ(e.target.value)}
                  placeholder="Soru"
                />
                <textarea
                  className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
                  rows={3}
                  value={editA}
                  onChange={(e) => setEditA(e.target.value)}
                  placeholder="Cevap"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateMut.mutate()}
                    disabled={updateMut.isPending || !editQ.trim() || !editA.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {updateMut.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                    Kaydet
                  </button>
                  <button
                    onClick={() => { setEditing(false); setEditQ(faq.question); setEditA(faq.answer); }}
                    className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="font-semibold text-sm text-foreground">{faq.question}</p>
                <div className="mt-1 flex items-start gap-2">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground mt-0.5">
                    C
                  </div>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
                {faq.sourceReviewIds.length > 0 && (
                  <p className="mt-1.5 text-[11px] text-muted-foreground/60">
                    Kaynak: {faq.sourceReviewIds.length} yorum
                  </p>
                )}
                {!isPublished && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                      Düzenle
                    </button>
                    <button
                      onClick={() => publishMut.mutate()}
                      disabled={publishMut.isPending}
                      className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {publishMut.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                      Yayınla
                    </button>
                  </div>
                )}
                {isPublished && (
                  <p className="mt-2 text-[11px] text-green-600">
                    Yayınlandı — {faq.publishedAt ? new Date(faq.publishedAt).toLocaleDateString("tr-TR") : ""}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SellerCustomerVoiceClient({ productId }: { productId: string }) {
  const [activeTab, setActiveTab] = useState<"replies" | "faq">("replies");
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["customer-voice", productId],
    queryFn: () => getCustomerVoice(productId),
  });

  const generateMut = useMutation({
    mutationFn: () => generateCustomerVoice(productId),
    onSuccess: (result) => {
      qc.setQueryData(["customer-voice", productId], result);
    },
    onError: (e: Error) => alert(`AI analizi başarısız: ${e.message}`),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Yüklenirken hata oluştu.
      </div>
    );
  }

  const reviews = data?.reviews ?? [];
  const replyDrafts = data?.replyDrafts ?? [];
  const faqDrafts = data?.faqDrafts ?? [];
  const needsReplyCount = replyDrafts.filter((d) => d.needsReply).length;
  const publishedReplies = replyDrafts.filter((d) => d.status === "published").length;
  const publishedFaqs = faqDrafts.filter((d) => d.status === "published").length;
  const hasDrafts = replyDrafts.length > 0 || faqDrafts.length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/seller/products" className="hover:text-foreground">
          Ürünlerim
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/seller/product/${productId}`} className="hover:text-foreground">
          Ürün Detayı
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">Müşteri Sesi AI</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
            <MessageCircle className="size-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Müşteri Sesi AI</h1>
            <p className="text-sm text-muted-foreground">
              Yorumlara AI yanıt taslakları ve SSS önerileri üret
            </p>
          </div>
        </div>
        <button
          onClick={() => generateMut.mutate()}
          disabled={generateMut.isPending}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-60"
        >
          {generateMut.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {hasDrafts ? "Yeniden Analiz Et" : "AI ile Analiz Et"}
        </button>
      </div>

      {/* Stats row */}
      {hasDrafts && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-foreground">{reviews.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Analiz Edilen Yorum</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-foreground">
              {publishedReplies}/{needsReplyCount}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Yanıt Yayınlandı</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-foreground">
              {publishedFaqs}/{faqDrafts.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">SSS Yayınlandı</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasDrafts && !generateMut.isPending && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
          <HelpCircle className="mx-auto size-10 text-muted-foreground/40 mb-3" />
          <p className="font-semibold text-foreground mb-1">Henüz analiz yapılmadı</p>
          <p className="text-sm text-muted-foreground">
            AI analiz et butonuna tıklayarak ürün yorumlarından yanıt taslakları ve SSS önerileri üret.
          </p>
        </div>
      )}

      {generateMut.isPending && (
        <div className="rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/5 p-10 text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-violet-500 mb-3" />
          <p className="font-semibold text-foreground mb-1">AI analiz ediyor...</p>
          <p className="text-sm text-muted-foreground">
            Yorumlar analiz ediliyor, yanıt taslakları ve SSS önerileri hazırlanıyor.
          </p>
        </div>
      )}

      {/* Tabs */}
      {hasDrafts && (
        <>
          <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
            <button
              onClick={() => setActiveTab("replies")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "replies"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yorum Yanıtları
              <span className="ml-1.5 rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-bold text-violet-600">
                {needsReplyCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "faq"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              SSS Önerileri
              <span className="ml-1.5 rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-bold text-violet-600">
                {faqDrafts.length}
              </span>
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "replies" && (
            <div className="space-y-3">
              {replyDrafts.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Yanıt taslağı yok.</p>
              ) : (
                replyDrafts.map((draft) => (
                  <ReplyDraftCard key={draft.id} draft={draft} productId={productId} />
                ))
              )}
            </div>
          )}

          {activeTab === "faq" && (
            <div className="space-y-3">
              {faqDrafts.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">SSS önerisi yok.</p>
              ) : (
                faqDrafts.map((faq, i) => (
                  <FaqDraftCard key={faq.id} faq={faq} index={i} productId={productId} />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
