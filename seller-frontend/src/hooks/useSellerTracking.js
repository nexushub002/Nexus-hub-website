import { useCallback } from 'react';
import { useSeller } from '../context/SellerContext';

export const useSellerTracking = () => {
  const { trackActivity, trackBusinessActivity, seller } = useSeller();

  // Product-related tracking
  const trackProductActivity = useCallback((action, productData = {}) => {
    trackBusinessActivity(`product_${action}`, {
      productId: productData.id,
      productName: productData.name,
      category: productData.category,
      price: productData.price,
      ...productData
    });
  }, [trackBusinessActivity]);

  // Order-related tracking
  const trackOrderActivity = useCallback((action, orderData = {}) => {
    trackBusinessActivity(`order_${action}`, {
      orderId: orderData.id,
      orderValue: orderData.total,
      customerInfo: orderData.customer,
      items: orderData.items?.length,
      ...orderData
    });
  }, [trackBusinessActivity]);

  // Dashboard interactions
  const trackDashboardActivity = useCallback((action, data = {}) => {
    trackActivity(`dashboard_${action}`, {
      section: data.section,
      feature: data.feature,
      ...data
    });
  }, [trackActivity]);

  // Profile and settings
  const trackProfileActivity = useCallback((action, data = {}) => {
    trackBusinessActivity(`profile_${action}`, {
      section: data.section,
      changes: data.changes,
      ...data
    });
  }, [trackBusinessActivity]);

  // Financial tracking
  const trackFinancialActivity = useCallback((action, data = {}) => {
    trackBusinessActivity(`financial_${action}`, {
      amount: data.amount,
      currency: data.currency || 'INR',
      type: data.type,
      ...data
    });
  }, [trackBusinessActivity]);

  // Customer interactions
  const trackCustomerActivity = useCallback((action, data = {}) => {
    trackBusinessActivity(`customer_${action}`, {
      customerId: data.customerId,
      customerType: data.customerType,
      interaction: data.interaction,
      ...data
    });
  }, [trackBusinessActivity]);

  // Inventory management
  const trackInventoryActivity = useCallback((action, data = {}) => {
    trackBusinessActivity(`inventory_${action}`, {
      productId: data.productId,
      quantity: data.quantity,
      operation: data.operation,
      ...data
    });
  }, [trackBusinessActivity]);

  // Marketing and promotions
  const trackMarketingActivity = useCallback((action, data = {}) => {
    trackBusinessActivity(`marketing_${action}`, {
      campaignId: data.campaignId,
      campaignType: data.campaignType,
      reach: data.reach,
      ...data
    });
  }, [trackBusinessActivity]);

  // Analytics and reports
  const trackAnalyticsActivity = useCallback((action, data = {}) => {
    trackActivity(`analytics_${action}`, {
      reportType: data.reportType,
      dateRange: data.dateRange,
      filters: data.filters,
      ...data
    });
  }, [trackActivity]);

  // Support and help
  const trackSupportActivity = useCallback((action, data = {}) => {
    trackActivity(`support_${action}`, {
      ticketId: data.ticketId,
      category: data.category,
      priority: data.priority,
      ...data
    });
  }, [trackActivity]);

  // Page navigation tracking
  const trackPageView = useCallback((pageName, data = {}) => {
    trackActivity('page_view', {
      page: pageName,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      ...data
    });
  }, [trackActivity]);

  // Feature usage tracking
  const trackFeatureUsage = useCallback((featureName, data = {}) => {
    trackActivity('feature_usage', {
      feature: featureName,
      usage_type: data.type || 'click',
      context: data.context,
      ...data
    });
  }, [trackActivity]);

  // Error tracking
  const trackError = useCallback((error, context = {}) => {
    trackActivity('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_type: error.name,
      page: window.location.pathname,
      context,
      timestamp: new Date().toISOString()
    });
  }, [trackActivity]);

  // Performance tracking
  const trackPerformance = useCallback((action, metrics = {}) => {
    trackActivity('performance', {
      action,
      load_time: metrics.loadTime,
      response_time: metrics.responseTime,
      page: window.location.pathname,
      ...metrics
    });
  }, [trackActivity]);

  // Search and filter tracking
  const trackSearchActivity = useCallback((searchTerm, filters = {}, results = {}) => {
    trackActivity('search', {
      search_term: searchTerm,
      filters,
      results_count: results.count,
      results_time: results.time,
      page: window.location.pathname
    });
  }, [trackActivity]);

  // Export functionality
  const trackExportActivity = useCallback((exportType, data = {}) => {
    trackBusinessActivity(`export_${exportType}`, {
      format: data.format,
      date_range: data.dateRange,
      filters: data.filters,
      record_count: data.recordCount,
      ...data
    });
  }, [trackBusinessActivity]);

  // Bulk operations
  const trackBulkOperation = useCallback((operation, data = {}) => {
    trackBusinessActivity(`bulk_${operation}`, {
      item_count: data.itemCount,
      success_count: data.successCount,
      failed_count: data.failedCount,
      operation_time: data.operationTime,
      ...data
    });
  }, [trackBusinessActivity]);

  return {
    // Core tracking
    trackActivity,
    trackBusinessActivity,
    
    // Specific domain tracking
    trackProductActivity,
    trackOrderActivity,
    trackDashboardActivity,
    trackProfileActivity,
    trackFinancialActivity,
    trackCustomerActivity,
    trackInventoryActivity,
    trackMarketingActivity,
    trackAnalyticsActivity,
    trackSupportActivity,
    
    // General tracking
    trackPageView,
    trackFeatureUsage,
    trackError,
    trackPerformance,
    trackSearchActivity,
    trackExportActivity,
    trackBulkOperation,
    
    // Utility
    isTracking: !!seller
  };
};

// Predefined tracking events for common actions
export const TRACKING_EVENTS = {
  // Product events
  PRODUCT_CREATED: 'created',
  PRODUCT_UPDATED: 'updated',
  PRODUCT_DELETED: 'deleted',
  PRODUCT_VIEWED: 'viewed',
  PRODUCT_PUBLISHED: 'published',
  PRODUCT_UNPUBLISHED: 'unpublished',
  
  // Order events
  ORDER_RECEIVED: 'received',
  ORDER_PROCESSED: 'processed',
  ORDER_SHIPPED: 'shipped',
  ORDER_DELIVERED: 'delivered',
  ORDER_CANCELLED: 'cancelled',
  ORDER_REFUNDED: 'refunded',
  
  // Dashboard events
  DASHBOARD_VIEWED: 'viewed',
  WIDGET_CLICKED: 'widget_clicked',
  REPORT_GENERATED: 'report_generated',
  
  // Profile events
  PROFILE_UPDATED: 'updated',
  PASSWORD_CHANGED: 'password_changed',
  SETTINGS_MODIFIED: 'settings_modified',
  
  // Financial events
  PAYMENT_RECEIVED: 'payment_received',
  PAYOUT_REQUESTED: 'payout_requested',
  INVOICE_GENERATED: 'invoice_generated',
  
  // Customer events
  CUSTOMER_CONTACTED: 'contacted',
  REVIEW_RESPONDED: 'review_responded',
  COMPLAINT_RESOLVED: 'complaint_resolved'
};

export default useSellerTracking;
