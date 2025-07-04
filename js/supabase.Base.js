// supabaseBase.js
// This file manages the core Supabase client check and the Blazor service reference.

let supabaseServiceInstance = null; // Stores the .NET object reference for callbacks from JS to C#

/**
 * Helper function to check if the Supabase client is initialized.
 * If not, it logs an error and notifies the Blazor service instance.
 * @returns {boolean} - True if the Supabase client is initialized, false otherwise.
 */
function checkSupabaseClient() {
    if (!window.supabaseJSClient) {
        console.error("JS: Supabase JS client is not initialized. Please check wwwroot/index.html.");
        if (supabaseServiceInstance) {
            // Notify Blazor about the error if the service instance is available
            supabaseServiceInstance.invokeMethodAsync('HandleJsError', 'Supabase JS client not initialized.');
        }
        return false;
    }
    return true;
}

/**
 * Sets the .NET object reference for callbacks from JavaScript to C#.
 * This is typically called by Blazor during initialization.
 * @param {object} dotNetObjRef - The .NET object reference.
 */
function setServiceReference(dotNetObjRef) {
    supabaseServiceInstance = dotNetObjRef;
    console.log("JS: SupabaseService .NET reference set in JS interop.");
}

/**
 * Notifies the Blazor application about a change in the authentication state.
 * It serializes the session object to be compatible with Blazor.
 * @param {object|null} session - The Supabase session object, or null if signed out.
 */
function notifyBlazorAuthChange(session) {
    if (supabaseServiceInstance) {
        // Create a serializable version of the session object
        const serializableSession = session ? {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_in: session.expires_in,
            expires_at: session.expires_at,
            token_type: session.token_type,
            user: session.user ? {
                id: session.user.id,
                email: session.user.email,
                created_at: session.user.created_at,
                last_sign_in_at: session.user.last_sign_in_at,
                aud: session.user.aud,
                email_confirmed_at: session.user.email_confirmed_at,
                phone: session.user.phone,
                role: session.user.role,
                updated_at: session.user.updated_at,
                user_metadata: session.user.user_metadata,
                app_metadata: session.user.app_metadata
            } : null
        } : null;

        console.log("JS: Invoking Blazor method OnJsAuthStateChanged with session:", serializableSession);
        // Invoke the Blazor method to update its authentication state
        supabaseServiceInstance.invokeMethodAsync('OnJsAuthStateChanged', serializableSession, "");
    } else {
        console.warn("JS: Blazor service instance not set for callback. Auth state change not notified.");
    }
}

// Export these core functions and variables for use by other modules
export {
    supabaseServiceInstance, // Exported to allow other modules to access the Blazor instance for error handling/callbacks
    checkSupabaseClient,
    setServiceReference,
    notifyBlazorAuthChange
};
