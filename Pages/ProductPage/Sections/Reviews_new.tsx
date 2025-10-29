"use client";
import React, { useState, useEffect, memo, useCallback } from 'react';
import { Star, Edit, Trash2, MessageCircle, Loader2, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { reviewService, Review, CreateReviewRequest, UpdateReviewRequest } from '@/services/api/reviews';

type Props = {
  productId: string;
};

const Reviews: React.FC<Props> = ({ productId }) => {
  const router = useRouter();
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
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Check authentication from localStorage
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('authToken'); // FIXED: Use 'authToken' as per ProductPage
        setAuthToken(storedToken);

        if (storedToken) {
          try {
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            setUserId(payload.userId || payload.id || null);
          } catch (error) {
            console.error('Error decoding token:', error);
            setUserId(null);
            setAuthToken(null);
          }
        } else {
          setUserId(null);
        }
      }
    };

    checkAuth();

    // Listen for localStorage changes (when user logs in/out)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (userId && reviews.length > 0) {
      setHasUserReview(reviews.some((r: Review) => r.userId._id === userId));
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
  }, [productId, refreshReviews]);

  const handleAddReview = async () => {
<<<<<<< HEAD
    if (!newReview.description.trim() || submitting || hasUserReview || !authToken) {
      if (!authToken) {
        setError('يرجى تسجيل الدخول أولاً لإضافة تقييم');
      }
      return;
    }
=======
    if (!newReview.description?.trim() || submitting || hasUserReview || !token) return;
>>>>>>> bcac2fd6e0f8dc7fe91cdb2fdfbbe974a97c5283

    try {
      setSubmitting(true);
      setError(null);
      await reviewService.addReview(newReview, authToken);
      setNewReview({ productId, description: '', rateNum: 5 });
      await refreshReviews(); // FIXED: Refresh cache
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في إضافة التعليق';
      if (errorMessage.includes('409') || errorMessage.includes('بالفعل')) {
        setError('لقد قمت بإضافة تقييم لهذا المنتج بالفعل');
      } else if (errorMessage.includes('logged in') || errorMessage.includes('تسجيل الدخول')) {
        setError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
        setAuthToken(null);
        setUserId(null);
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
    if (!editForm.description?.trim() || !editingId || submitting || !authToken) {
      if (!authToken) {
        setError('يرجى تسجيل الدخول أولاً لتعديل التقييم');
      }
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await reviewService.updateReview(editingId, editForm, authToken);
      setEditingId(null);
      setEditForm({ description: '', rateNum: 5 });
      await refreshReviews(); // FIXED: Refresh cache
    } catch (err: any) {
      setError(err.message || 'فشل في تحديث التعليق');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (submitting || !authToken) return;

    if (!window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

    try {
      setSubmitting(true);
      setError(null);
      await reviewService.deleteReview(reviewId, authToken);
      await refreshReviews(); // FIXED: Refresh cache
    } catch (err: any) {
      setError(err.message || 'فشل في حذف التعليق');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ description: '', rateNum: 5 });
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  const isUserReview = (review: Review) => {
    return userId && review.userId._id === userId;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>جاري تحميل التعليقات...</span>
          </div>
        </section>
        {/* Add placeholder for form section */}
        <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
          <h2 className="text-right text-lg font-bold mb-4">أضف تقييمك</h2>
          <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
        </section>
      </div>
    );
  }

  if (error && !error.includes('بالفعل')) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        {/* Form section remains */}
        <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
          <h2 className="text-right text-lg font-bold mb-4">أضف تقييمك</h2>
          {authToken ? (
            <div className="text-center py-8 text-gray-500">قم بإصلاح الخطأ أولاً</div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
              <LogIn className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium mb-2">يرجى تسجيل الدخول</p>
              <p className="text-sm mb-4">قم بتسجيل الدخول لإضافة تعليقك وتقييم المنتج</p>
              <button
                onClick={handleLoginRedirect}
                className="bg-primary text-white px-6 py-2 rounded-lg text-sm hover:bg-primary/90 flex items-center gap-2 transition-colors mx-auto"
              >
                <LogIn className="w-4 h-4" />
                تسجيل الدخول
              </button>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Reviews List Section */}
      <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-right text-lg sm:text-xl font-bold text-black87">التعليقات</h2>
          <span className="text-black60 text-sm">({reviews.length})</span>
        </div>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-black60">
            لا توجد تعليقات بعد. كن الأول!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article key={review._id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rateNum ? 'text-amber-500 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-black87 font-medium">{review.userId.firstName || 'مستخدم'}</span>
                    </div>
                    <p className="text-black60 text-sm mb-2">{review.description}</p>
                    <time className="text-black40 text-xs">{new Date(review.date || review.createdAt || '').toLocaleDateString('ar-EG')}</time>
                  </div>
                  {isUserReview(review) && authToken && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        aria-label="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        aria-label="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Add/Edit Review Section */}
      <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-bold mb-4 text-right">
          {editingId ? "تعديل التقييم" : "أضف تقييمك"}
        </h2>

        {authToken ? (
          hasUserReview && !editingId ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="mb-3 text-green-700">لقد قمت بإضافة تقييم لهذا المنتج بالفعل</p>
              <button
                onClick={() => {
                  const userReview = reviews.find(r => isUserReview(r));
                  if (userReview) {
                    handleEditReview(userReview);
                  }
                }}
                className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
              >
                تعديل التقييم الحالي
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-right">تعليقك:</label>
                <textarea
                  placeholder="شاركنا برأيك في هذا المنتج..."
                  value={editingId ? editForm.description || '' : newReview.description || ''}
                  onChange={(e) => {
                    if (editingId) {
                      setEditForm((prev) => ({ ...prev, description: e.target.value }));
                    } else {
                      setNewReview((prev) => ({ ...prev, description: e.target.value }));
                    }
                  }}
                  className="w-full p-3 border rounded-lg text-sm min-h-[100px] focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-right">التقييم:</label>
                <div className="flex gap-1 justify-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (editingId) {
                          setEditForm((prev) => ({ ...prev, rateNum: i + 1 }));
                        } else {
                          setNewReview((prev) => ({ ...prev, rateNum: i + 1 }));
                        }
                      }}
                      className={`w-8 h-8 transition-all duration-200 hover:scale-110 ${
                        i < (editingId ? editForm.rateNum || 0 : newReview.rateNum)
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-gray-300 hover:text-amber-400'
                      }`}
                    >
                      <Star className="w-full h-full fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                {editingId ? (
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
                ) : (
                  <button
                    onClick={handleAddReview}
                    disabled={submitting || !newReview.description?.trim()}
                    className="bg-primary text-white px-6 py-2 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-colors"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    إضافة التعليق
                  </button>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
            <LogIn className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium mb-2">يرجى تسجيل الدخول</p>
            <p className="text-sm mb-4">قم بتسجيل الدخول لإضافة تعليقك وتقييم المنتج</p>
            <button
              onClick={handleLoginRedirect}
              className="bg-primary text-white px-6 py-2 rounded-lg text-sm hover:bg-primary/90 flex items-center gap-2 transition-colors mx-auto"
            >
              <LogIn className="w-4 h-4" />
              تسجيل الدخول
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm text-center">{error}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default memo(Reviews);