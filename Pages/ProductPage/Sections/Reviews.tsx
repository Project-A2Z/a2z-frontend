"use client";
import React, { useState, useEffect, memo, useCallback } from 'react';
import { Star, Edit, Trash2, MessageCircle, Loader2, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { reviewService, Review, CreateReviewRequest, UpdateReviewRequest } from '@/services/api/reviews';
import Alert from '@/components/UI/Alert/alert';

type Props = {
  productId: string;
  onReviewAdded?: () => Promise<void>; // ✅ Added this line
};

const Reviews: React.FC<Props> = ({ productId, onReviewAdded }) => { // ✅ Added onReviewAdded to destructuring
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
  // Alert modals state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [errorAlertOpen, setErrorAlertOpen] = useState(false);

  // Open error alert whenever error message is set
  useEffect(() => {
    if (error) setErrorAlertOpen(true);
  }, [error]);

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
      
      // Show message if there was an issue but we got empty results
      if (response.message && fetchedReviews.length === 0 && response.message !== 'success') {
        console.warn('⚠️ Reviews loaded with warning:', response.message);
        // Don't set error, just log it - the app will show "no reviews" message
      }
    } catch (err: any) {
      // console.error('❌ Get reviews error:', err);
      // This should rarely happen now since API returns empty data instead of throwing
      setReviews([]);
      setError(null); // Don't show error, just show empty state
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
        // //console.log('❌ No auth token found');
        setError('يرجى تسجيل الدخول أولاً لإضافة تقييم');
      } else if (hasUserReview) {
        setError('لقد قمت بإضافة تقييم لهذا المنتج بالفعل');
      }
      return;
    }

    // //console.log('🚀 Attempting to add review...');
    // //console.log('📦 Review data:', newReview);
    // //console.log('🔑 Auth token:', authToken.substring(0, 20) + '...');

    try {
      setSubmitting(true);
      setError(null); // Clear any previous errors
      await reviewService.addReview(newReview, authToken);
      // //console.log('✅ Review added successfully');
      setNewReview({ productId, description: '', rateNum: 5 });
      await refreshReviews();
      
      // ✅ Call the callback to update parent component's ratings
      if (onReviewAdded) {
        await onReviewAdded();
      }
    } catch (err: any) {
      // console.error('❌ Add review error:', err);
      const errorMessage = err.message || 'فشل في إضافة التعليق';

      // Handle specific error cases
      if (errorMessage.includes('409') || errorMessage.includes('بالفعل')) {
        setError('لقد قمت بإضافة تقييم لهذا المنتج بالفعل');
        setHasUserReview(true);
      } else if (errorMessage.includes('انتهت صلاحية') || errorMessage.includes('401')) {
        setError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
        setAuthToken(null);
        setUserId(null);
      } else if (errorMessage.includes('البيانات') || errorMessage.includes('400')) {
        setError('يرجى التأكد من صحة البيانات المدخلة');
      } else {
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review: Review) => {
    // Double-check that this is the user's review before allowing edit
    if (!isUserReview(review)) {
      setError('لا يمكنك تعديل تعليق لم تقم بكتابته');
      return;
    }

    if (submitting) {
      setError('يرجى الانتظار حتى انتهاء العملية الحالية');
      return;
    }

    setEditingId(review._id);
    setEditForm({
      description: review.description || '',
      rateNum: review.rateNum,
    });
    setError(null); // Clear any existing errors
  };

  const handleUpdateReview = async () => {
    if (!editForm.description?.trim() || !editingId || submitting || !authToken) {
      if (!authToken) {
        setError('يرجى تسجيل الدخول أولاً لتعديل التقييم');
      }
      return;
    }

    // Double-check that this is the user's review
    const reviewToUpdate = reviews.find(r => r._id === editingId);
    if (!reviewToUpdate || !isUserReview(reviewToUpdate)) {
      setError('لا يمكنك تعديل تعليق لم تقم بكتابته');
      return;
    }

    try {
      setSubmitting(true);
      setError(null); // Clear any previous errors
      // API expects productId, not reviewId
      await reviewService.updateReview(productId, editForm, authToken);
      setEditingId(null);
      setEditForm({ description: '', rateNum: 5 });
      await refreshReviews();
      
      // ✅ Call the callback to update parent component's ratings
      if (onReviewAdded) {
        await onReviewAdded();
      }
    } catch (err: any) {
      // console.error('Update review error:', err);
      const errorMessage = err.message || 'فشل في تحديث التعليق';

      // Handle specific error cases
      if (errorMessage.includes('لم يتم العثور') || errorMessage.includes('404')) {
        // Review was deleted, refresh the list and exit edit mode
        setError('لم يتم العثور على تقييمك لهذا المنتج');
        setEditingId(null);
        setEditForm({ description: '', rateNum: 5 });
        await refreshReviews();
      } else if (errorMessage.includes('غير مسموح') || errorMessage.includes('403')) {
        setError('لا تملك صلاحية تعديل هذا التعليق');
        setEditingId(null);
        setEditForm({ description: '', rateNum: 5 });
      } else if (errorMessage.includes('انتهت صلاحية') || errorMessage.includes('401')) {
        setError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
        setAuthToken(null);
        setUserId(null);
        setEditingId(null);
        setEditForm({ description: '', rateNum: 5 });
      } else if (errorMessage.includes('البيانات') || errorMessage.includes('400')) {
        setError('يرجى التأكد من صحة البيانات المدخلة');
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

    // Ensure the clicked review belongs to the current user
    const reviewToDelete = reviews.find(r => r._id === reviewId);
    if (!reviewToDelete || !isUserReview(reviewToDelete)) {
      setError('لا يمكنك حذف تعليق لم تقم بكتابته');
      return;
    }

    // Open confirmation modal
    setDeleteTargetId(reviewId);
    setConfirmDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTargetId || !authToken) {
      setConfirmDeleteOpen(false);
      setDeleteTargetId(null);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Execute the delete - NOW PASSING productId as second parameter
      await reviewService.deleteReview(deleteTargetId, productId, authToken);

      // Immediately refresh the list after successful delete
      //console.log('✅ Review deleted, refreshing list...');
      await refreshReviews();

      // ✅ Call the callback to update parent component's ratings
      if (onReviewAdded) {
        await onReviewAdded();
      }

      // Clear all states
      setError(null);
      setConfirmDeleteOpen(false);
      setDeleteTargetId(null);
      //console.log('✅ Delete completed successfully');

    } catch (err: any) {
      const errorMessage = err.message || 'فشل في حذف التعليق';

      if (errorMessage.includes('غير موجود') || errorMessage.includes('تم حذفه') || errorMessage.includes('404')) {
        setError('التعليق غير موجود أو تم حذفه بالفعل');
      } else if (errorMessage.includes('غير مسموح') || errorMessage.includes('403')) {
        setError('لا تملك صلاحية حذف هذا التعليق');
      } else if (errorMessage.includes('انتهت صلاحية') || errorMessage.includes('401')) {
        setError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
        setAuthToken(null);
        setUserId(null);
      } else {
        setError(errorMessage);
      }

      // Always refresh the list even on error to sync with backend state
      //console.log('⚠️ Delete failed, but refreshing list to sync state...');
      await refreshReviews();

    } finally {
      setSubmitting(false);
      setConfirmDeleteOpen(false);
      setDeleteTargetId(null);
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Reviews List Section */}
      <section className="bg-white rounded-lg md:rounded-2xl border shadow-sm p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h2 className="text-right text-base sm:text-lg md:text-xl font-bold text-black87">التعليقات والتقييمات</h2>
          <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">({reviews.length})</span>
        </div>

        <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1">
          {reviews.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
              <p className="text-sm sm:text-base">لا توجد تعليقات بعد</p>
              <p className="text-xs sm:text-sm mt-1">كن أول من يضيف تعليق!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <article key={review._id} className="border-b border-gray-100 pb-3 sm:pb-4 last:border-b-0">
                <div className={`space-y-2 sm:space-y-3 ${editingId === review._id ? 'bg-blue-50 p-2 sm:p-3 rounded-lg border-2 border-blue-300 relative' : ''}`}>
                    {editingId === review._id && (
                      <div className="absolute -top-1 left-2 sm:left-4 bg-blue-600 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-b-md shadow-sm">
                        جاري التعديل ←
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                          {review.userId.firstName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-black87 truncate">
                            {review.userId.firstName} {review.userId.lastName}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-600">
                            {new Date(review.createdAt || '').toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
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
                              className="p-1.5 sm:p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded touch-manipulation"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="p-1.5 sm:p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded touch-manipulation"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-xs sm:text-sm text-black87 leading-relaxed break-words">
                      {review.description}
                    </p>

                    {/* Reply if exists */}
                    {review.reply && (
                      <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-primary/10 border-r-4 border-primary rounded-l-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                          <span className="text-xs sm:text-sm font-medium text-primary">رد من الإدارة</span>
                        </div>
                        <p className="text-xs sm:text-sm text-primary/80 break-words">{review.reply}</p>
                      </div>
                    )}
                  </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Add/Edit Review Section */}
      <section className="bg-white rounded-lg md:rounded-2xl border shadow-sm p-3 sm:p-4 md:p-6">
        <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-right">
          {editingId ? "تعديل التقييم" : "أضف تقييمك"}
        </h2>

        {authToken ? (
          hasUserReview && !editingId ? (
            <div className="text-green-700 text-center bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <p className="mb-2 sm:mb-3 text-xs sm:text-sm">لقد قمت بإضافة تقييم لهذا المنتج بالفعل</p>
              <button
                onClick={() => {
                  // Find user's review and set it for editing
                  const userReview = reviews.find(r => isUserReview(r));
                  if (userReview) {
                    handleEditReview(userReview);
                  }
                }}
                className="text-blue-600 hover:text-blue-800 underline text-xs sm:text-sm font-medium touch-manipulation"
              >
                تعديل التقييم الحالي
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border">
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-2 text-right">تعليقك:</label>
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
                  className="w-full p-2 sm:p-3 border rounded-lg text-xs sm:text-sm min-h-[100px] sm:min-h-[120px] focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                  required
                />
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-2 text-right">التقييم:</label>
                <div className="flex gap-1 sm:gap-2 justify-center">
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
                      className={`w-9 h-9 sm:w-8 sm:h-8 transition-all duration-200 hover:scale-110 touch-manipulation ${
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

              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                {editingId ? (
                  <>
                    <button
                      onClick={handleUpdateReview}
                      disabled={submitting || !editForm.description?.trim()}
                      className="bg-green-600 text-white px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation w-full sm:w-auto"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      حفظ التعديل
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-gray-600 touch-manipulation w-full sm:w-auto"
                    >
                      إلغاء
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddReview}
                    disabled={submitting || !newReview.description?.trim()}
                    className="bg-primary text-white px-6 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors touch-manipulation w-full sm:w-auto"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    إضافة التعليق
                  </button>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-6 sm:py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
            <LogIn className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
            <p className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">يرجى تسجيل الدخول</p>
            <p className="text-xs sm:text-sm mb-3 sm:mb-4 px-4">قم بتسجيل الدخول لإضافة تعليقك وتقييم المنتج</p>
            <button
              onClick={handleLoginRedirect}
              className="bg-primary text-white px-6 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-primary/90 flex items-center gap-2 transition-colors mx-auto touch-manipulation"
            >
              <LogIn className="w-4 h-4" />
              تسجيل الدخول
            </button>
          </div>
        )}

        {/* Alerts */}
        <Alert
          isOpen={confirmDeleteOpen}
          title="تأكيد الحذف"
          message="هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء."
          type="warning"
          onCancel={() => { setConfirmDeleteOpen(false); setDeleteTargetId(null); }}
          onConfirm={executeDelete}
          confirmText="حذف"
          cancelText="إلغاء"
        />
        <Alert
          isOpen={!!error && errorAlertOpen}
          title="خطأ"
          message={error || ''}
          type="error"
          onCancel={() => { setErrorAlertOpen(false); setError(null); }}
          onConfirm={() => { setErrorAlertOpen(false); setError(null); }}
          confirmText="حسناً"
          cancelText="إغلاق"
        />
      </section>
    </div>
  );
};

export default memo(Reviews);