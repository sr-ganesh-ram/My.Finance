// supabaseAuth.js
// This file contains all authentication-related methods for Supabase.

// Import necessary core functions from supabaseBase.js
import { checkSupabaseClient, supabaseServiceInstance, notifyBlazorAuthChange } from './supabase.Base.js';

/**
 * Initiates Google OAuth sign-in redirect.
 * @param {string} redirectToUrl - The URL to redirect to after successful authentication.
 * @returns {void}
 */
async function signInWithGoogleRedirect(redirectToUrl) {
    if (!checkSupabaseClient()) return; // Check if Supabase client is initialized

    console.log("JS: Calling signInWithOAuth with redirectTo:", redirectToUrl);
    try {
        const { data, error } = await window.supabaseJSClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectToUrl,
                queryParams: {
                    access_type: 'offline', // Request refresh token
                    prompt: 'consent',     // Prompt for consent every time
                }
            },
        });

        if (error) {
            console.error('JS: Supabase OAuth Error:', error.message);
            if (supabaseServiceInstance) {
                supabaseServiceInstance.invokeMethodAsync('HandleJsError', error.message);
            }
        } else if (data.url) {
            console.log("JS: Redirecting to OAuth URL:", data.url);
            window.location.href = data.url; // Redirect the user to the OAuth URL
        }
    } catch (e) {
        console.error('JS: Supabase OAuth Catch Error:', e);
        if (supabaseServiceInstance) {
            supabaseServiceInstance.invokeMethodAsync('HandleJsError', e.message);
        }
    }
}

/**
 * Signs out the current user from Supabase.
 * @returns {void}
 */
async function signOut() {
    if (!checkSupabaseClient()) return; // Check if Supabase client is initialized

    console.log("JS: Calling signOut.");
    try {
        const { error } = await window.supabaseJSClient.auth.signOut();
        if (error) {
            console.error('JS: Sign Out Error:', error.message);
            if (supabaseServiceInstance) {
                supabaseServiceInstance.invokeMethodAsync('HandleJsError', error.message);
            }
        } else {
            console.log('JS: Signed out successfully.');
        }
    } catch (e) {
        console.error('JS: Sign Out Catch Error:', e);
        if (supabaseServiceInstance) {
            supabaseServiceInstance.invokeMethodAsync('HandleJsError', e.message);
        }
    }
}

/**
 * Fetches the initial session from Supabase and notifies Blazor.
 * This is typically called once on application startup.
 * @returns {void}
 */
async function getInitialSession() {
    if (!checkSupabaseClient()) return; // Check if Supabase client is initialized

    console.log("JS: Getting initial session.");
    try {
        const { data: { session }, error } = await window.supabaseJSClient.auth.getSession();
        if (error) {
            console.error('JS: Get Session Error:', error.message);
            if (supabaseServiceInstance) {
                supabaseServiceInstance.invokeMethodAsync('HandleJsError', error.message);
            }
        } else {
            notifyBlazorAuthChange(session); // Notify Blazor about the session
        }
    } catch (e) {
        console.error('JS: Get Session Catch Error:', e);
        if (supabaseServiceInstance) {
            supabaseServiceInstance.invokeMethodAsync('HandleJsError', e.message);
        }
    }
}

/**
 * Sets up a listener for authentication state changes from Supabase.
 * This listener will notify Blazor whenever the auth state changes (e.g., sign in, sign out).
 * @returns {void}
 */
function setupAuthListener() {
    if (!checkSupabaseClient()) return; // Check if Supabase client is initialized

    console.log("JS: Setting up auth state change listener.");
    window.supabaseJSClient.auth.onAuthStateChange((event, session) => {
        console.log("JS: Auth state changed event:", event, "session:", session);
        notifyBlazorAuthChange(session); // Notify Blazor about the auth state change
    });
}

/**
 * Retrieves the Supabase authentication token from local storage.
 * @param {string} projectRef - The Supabase project reference.
 * @returns {string|null} - The auth token string, or null if not found.
 */
function getLocalStorageToken(projectRef) {
    const supabaseAuthKey = `sb-${projectRef}-auth-token`;
    return localStorage.getItem(supabaseAuthKey);
}

// Export all authentication functions
export {
    signInWithGoogleRedirect,
    signOut,
    getInitialSession,
    setupAuthListener,
    getLocalStorageToken
};
