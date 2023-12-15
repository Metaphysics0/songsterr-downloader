import { browser } from '$app/environment';
import { PUBLIC_PAYPAL_SANDBOX_CLIENT_ID } from '$env/static/public';
import { apiService } from '$lib/apiService';
import { logger } from '$lib/utils/logger';
import { loadScript } from '@paypal/paypal-js';
