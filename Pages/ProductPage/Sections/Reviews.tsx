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
        const storedToken = localStorage.getItem('auth_token');
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
      if (e.key === 'auth_token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
    } catch (err: any) {
      console.error('Get reviews error:', err);
      const errorMessage = err.message || 'فشل في جلب التعليقات';
      if (errorMessage.includes('logged in') || errorMessage.includes('تسجيل الدخول')) {
        setError('يرجى تسجيل الدخول لعرض التعليقات');
        setAuthToken(null);
        setUserId(null);
      } else {
        setError(errorMessage);
      }
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
    if (!newReview.description?.trim() || submitting || hasUserReview || !authToken) {
      if (!authToken) {
        console.log('❌ No auth token found');
        setError('يرجى تسجيل الدخول أولاً لإضافة تقييم');
      } else {
        console.log('✅ Auth token found:', authToken.substring(0, 20) + '...');
      }
      return;
    }

    console.log('🚀 Attempting to add review...');
    console.log('📦 Review data:', newReview);
    console.log('🔑 Auth token:', authToken.substring(0, 20) + '...');

    try {
      setSubmitting(true);
      await reviewService.addReview(newReview, authToken);
      console.log('✅ Review added successfully');
      setNewReview({ productId, description: '', rateNum: 5 });
      await refreshReviews();
    } catch (err: any) {
      console.error('❌ Add review error:', err);
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
      await reviewService.updateReview(productId, editForm, authToken);
      setEditingId(null);
      setEditForm({ description: '', rateNum: 5 });
      await refreshReviews();
    } catch (err: any) {
      console.error('Update review error:', err);
      const errorMessage = err.message || 'فشل في تحديث التعليق';
      if (errorMessage.includes('logged in') || errorMessage.includes('تسجيل الدخول')) {
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

  const handleDeleteReview = async (reviewId: string) => {
    if (submitting || !authToken) {
      if (!authToken) {
        setError('يرجى تسجيل الدخول أولاً لحذف التقييم');
      }
      return;
    }

    if (!window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

    try {
      setSubmitting(true);
      await reviewService.deleteReview(productId, authToken);
      await refreshReviews();
    } catch (err: any) {
      console.error('Delete review error:', err);
      const errorMessage = err.message || 'فشل في حذف التعليق';
      if (errorMessage.includes('logged in') || errorMessage.includes('تسجيل الدخول')) {
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

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ description: '', rateNum: 5 });
  };

  const isUserReview = (review: Review) => {
    return userId && review.userId._id === userId;
  };

  const handleLoginRedirect = () => {
    router.push('/login');
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
          <div className="mt-3 flex justify-center gap-2">
            <button
              onClick={() => {
                setError(null);
                refreshReviews();
              }}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              إعادة المحاولة
            </button>
            {error.includes('تسجيل الدخول') && (
              <button
                onClick={handleLoginRedirect}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90"
              >
                تسجيل الدخول
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Debug Panel - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-yellow-800">🔧 Debug Info (Development Only)</summary>
            <div className="mt-2 space-y-1 text-yellow-700">
              <div>Product ID: {productId}</div>
              <div>Auth Token: {authToken ? `${authToken.substring(0, 20)}...` : 'Not found'}</div>
              <div>User ID: {userId || 'Not found'}</div>
              <div>Has User Review: {hasUserReview ? 'Yes' : 'No'}</div>
              <div>Reviews Count: {reviews.length}</div>
              <div>LocalStorage Token: {typeof window !== 'undefined' ? localStorage.getItem('auth_token')?.substring(0, 20) + '...' : 'N/A'}</div>
              <button
                onClick={() => {
                  const token = localStorage.getItem('auth_token');
                  console.log('🔍 Manual token check:', token);
                  console.log('🔍 Token decoded:', token ? JSON.parse(atob(token.split('.')[1])) : 'No token');
                  alert(`Token: ${token ? 'Found' : 'Not found'}\nLength: ${token?.length || 0}\nUser ID: ${token ? JSON.parse(atob(token.split('.')[1])).userId || JSON.parse(atob(token.split('.')[1])).id : 'N/A'}`);
                }}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-xs"
              >
                Test Auth
              </button>
            </div>
          </details>
        </div>
      )}

      {/* Reviews List Section */}
      <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-right text-lg sm:text-xl font-bold text-black87">التعليقات والتقييمات</h2>
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">({reviews.length})</span>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>لا توجد تعليقات بعد</p>
              <p className="text-sm mt-1">كن أول من يضيف تعليق!</p>
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
                            {new Date(review.createdAt || '').toLocaleDateString('ar-EG')}
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
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
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
                      <div className="mt-3 p-3 bg-primary/10 border-r-4 border-primary rounded-l-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-primary">رد من الإدارة</span>
                        </div>
                        <p className="text-sm text-primary/80">{review.reply}</p>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      {/* Add/Edit Review Section */}
      <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-bold mb-4 text-right">
          {editingId ? "تعديل التقييم" : "أضف تقييمك"}
        </h2>

        {authToken ? (
          hasUserReview && !editingId ? (
            <div className="text-green-700 text-center bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="mb-3">لقد قمت بإضافة تقييم لهذا المنتج بالفعل</p>
              <button
                onClick={() => {
                  // Find user's review and set it for editing
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
                  value={editingId ? editForm.description || '' : newReview.description}
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
                  <>
                    <button
                      onClick={handleUpdateReview}
                      disabled={submitting || !editForm.description?.trim()}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      حفظ التعديل
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600"
                    >
                      إلغاء
                    </button>
                  </>
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