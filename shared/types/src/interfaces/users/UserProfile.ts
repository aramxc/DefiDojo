export interface UserProfile {
    // Core identity (from USERS.PROFILES table)
    user_id: string;
    email: string;
    username: string;
    wallet_address: string | null;
    is_email_verified: boolean;
    created_at: string;
    updated_at: string;
    last_login: string | null;
  
    // Subscription related (from USERS.SUBSCRIPTION_TYPES and USER_SUBSCRIPTIONS)
    subscriptions: {
      type_id: string;
      expires_at: string;
      is_active: boolean;
      assets: string[]; // Array of asset symbols with pro access
    }[];
  
    // User preferences (TODO: add a new table for these)
    preferences?: {
      default_dashboard_view?: string;
      saved_charts?: {
        id: string;
        name: string;
        asset: string;
        timeframe: string;
        indicators: string[];
      }[];
      favorite_assets?: string[];
      notification_settings?: {
        email_alerts: boolean;
        price_alerts: boolean;
      };
    };
  }