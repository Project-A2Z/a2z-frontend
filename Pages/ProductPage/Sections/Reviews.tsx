"use client";
import React, { useState, useEffect, memo, useCallback } from 'react';
import { Star, Edit, Trash2, MessageCircle, Loader2 } from 'lucide-react';
import { reviewService, Review, CreateReviewRequest, UpdateReviewRequest } from '@/services/api/reviews';

type Props = {
  productId: string;
  token?: string;
};

const Reviews: React.FC<Props> = ({ productId, token }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newReview, setNewReview] = useState<CreateReviewRequest>({
    productId,
    description: '',
    rateNum: 5
  });
  const [editForm, setEditForm] = useState<UpdateReviewRequest>({
    description: '',
    rateNum: 5
  });
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasUserReview, setHasUserReview] = useState<boolean>(false);

  useEffect(() => {
    const getCurrentUserId = (): string | null => {
      if (typeof window === 'undefined') return null;
      try {
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.id || null;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    };
    setUserId(getCurrentUserId());
  }, [token]);

  useEffect(() => {
    if (userId && reviews.length > 0) {
      setHasUserReview(reviews.some((r) => r.userId._id === userId));
    } else {
      setHasUserReview(false);
    }
  }, [userId, reviews]);

  const refreshReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewService.getProductReviews(productId);
      const fetchedReviews = response.data?.reviews || [];
      setReviews(fetchedReviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب التعليقات');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      refreshReviews();
    }
  }, [productId]); // Remove refreshReviews from dependencies to prevent infinite loop

  const handleAddReview = async () => {
    if (!newReview.description.trim() || submitting || hasUserReview || !token) return;

    try {
      setSubmitting(true);
      await reviewService.addReview(newReview, token);
      setNewReview({ productId, description: '', rateNum: 5 });
      await refreshReviews();
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في إضافة التعليق';
      if (errorMessage.includes('409') || errorMessage.includes('بالفعل')) {
        setError('لقد قمت بإضافة تقييم لهذا المنتج بالفعل');
      } else {
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingId(review._id);
    setEditForm({
      description: review.description || '',
      rateNum: review.rateNum,
    });
  };

  const handleUpdateReview = async () => {
    if (!editForm.description?.trim() || !editingId || submitting || !token) return;

    try {
      setSubmitting(true);
      await reviewService.updateReview(editingId, editForm, token);
      setEditingId(null);
      setEditForm({ description: '', rateNum: 5 });
      await refreshReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديث التعليق');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (submitting || !token) return;

    if (!window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

    try {
      setSubmitting(true);
      await reviewService.deleteReview(reviewId, token);
      await refreshReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في حذف التعليق');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ description: '', rateNum: 5 });
  };

  const isUserReview = (review: Review) => {
    return userId && review.userId._id === userId;
  };

  if (loading) {
    return (
      <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin ml-2" />
          <span>جاري التحميل...</span>
        </div>
      </section>
    );
  }

  if (error && !error.includes('بالفعل')) {
    return (
      <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
        <div className="text-red-600 text-center py-4">
          خطأ: {error}
          <button
            onClick={() => refreshReviews()}
            className="block mx-auto mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            إعادة المحاولة
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-right text-lg sm:text-xl font-bold text-black87">التعليقات</h2>
        <span className="text-sm text-gray-600">({reviews.length})</span>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد تعليقات بعد
          </div>
        ) : (
          reviews.map((review) => (
            <article key={review._id} className="border-b border-gray-100 pb-4 last:border-b-0">
              {editingId === review._id ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="mb-3">
                    <textarea
                      placeholder="اكتب تعليقك هنا..."
                      value={editForm.description}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 border rounded-lg text-sm min-h-[80px]"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-2">التقييم:</label>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEditForm((prev) => ({ ...prev, rateNum: i + 1 }))}
                          className={`w-6 h-6 ${i < (editForm.rateNum || 5) ? 'text-amber-500' : 'text-gray-300'}`}
                        >
                          <Star className="w-full h-full fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateReview}
                      disabled={submitting || !editForm.description?.trim()}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      حفظ
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                        {review.userId.firstName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-black87">
                          {review.userId.firstName} {review.userId.lastName}
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(review.rateNum)
                                ? 'fill-amber-500 text-amber-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {isUserReview(review) && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-black87 leading-relaxed">
                    {review.description}
                  </p>

                  {/* Reply if exists */}
                  {review.reply && (
                    <div className="mt-3 p-3 bg-blue-50 border-r-4 border-blue-400 rounded-l-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">رد من الإدارة</span>
                      </div>
                      <p className="text-sm text-blue-700">{review.reply}</p>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {/* Review Form - Now at the bottom */}
      {token && !hasUserReview && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-md font-semibold mb-3 text-right">أضف تعليقك</h3>

          <div className="mb-3">
            <textarea
              placeholder="اكتب تعليقك هنا..."
              value={newReview.description}
              onChange={(e) => setNewReview((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 sm:p-3 border rounded-lg text-sm min-h-[80px] focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-2 text-right">التقييم:</label>
            <div className="flex gap-1 justify-end">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNewReview((prev) => ({ ...prev, rateNum: i + 1 }))}
                  className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                    i < newReview.rateNum ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-amber-400'
                  }`}
                >
                  <Star className="w-full h-full fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleAddReview}
              disabled={submitting || !newReview.description.trim()}
              className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? 'جاري الإضافة...' : 'إضافة التعليق'}
            </button>
          </div>
        </div>
      )}

      {token && hasUserReview && (
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm text-center">
            لقد قمت بإضافة تقييم لهذا المنتج بالفعل
          </p>
        </div>
      )}
    </section>
  );
};

export default memo(Reviews);