// supabaseInterop.js (Main Entry Point)
// This file acts as the primary interface for Blazor, consolidating all Supabase functionalities.

// Import core functionalities and setup from supabaseBase.js
import { setServiceReference, setupAuthListener } from './supabase.Base.js';

// Import authentication functions from supabaseAuth.js
import {
    signInWithGoogleRedirect,
    signOut,
    getLocalStorageToken,
    getInitialSession
} from './supabase.Auth.js';

// Import generic CRUD and search functions from supabaseGenericCrud.js
import {
    insert,
    update,
    deleteById, // Renamed from 'delete' in the generic file to avoid conflict and be explicit
    searchById,
    searchByName
} from './supabase.GenericCrud.js';

// Import task-specific functions from supabaseTasks.js
import {
    fetchTasks,
    insertTask,
    updateTask,
    deleteTask,
    searchTasksByNameWithPagination
} from './supabase.Tasks.js';

// Consolidate all imported functions into the window.supabaseInterop object.
// This makes them accessible to Blazor applications via JavaScript interop.
window.supabaseInterop = {
    // Base and Authentication
    setServiceReference: setServiceReference,
    getInitialSession: getInitialSession, // This will call the getInitialSession logic from supabaseAuth
    setupAuthListener: setupAuthListener, // This will call the setupAuthListener logic from supabaseAuth
    signInWithGoogleRedirect: signInWithGoogleRedirect,
    signOut: signOut,
    getLocalStorageToken: getLocalStorageToken,

    // Generic CRUD Operations
    insert: insert,
    update: update,
    delete: deleteById, // Expose deleteById as 'delete' for Blazor interop
    searchById: searchById,
    searchByName: searchByName,

    // Task-Specific Operations
    fetchTasks: fetchTasks,
    insertTask: insertTask,
    updateTask: updateTask,
    deleteTask: deleteTask,
    searchTasksByNameWithPagination: searchTasksByNameWithPagination
};

// Initial calls that were previously in setServiceReference, now explicitly called
// or intended to be called by Blazor after setServiceReference.
// For example, your Blazor app might call these after the JS reference is set up:
// `setServiceReference` should still be the first call from Blazor.
// Inside `setServiceReference` (in supabaseBase.js), I've kept the calls to `getInitialSession()` and `setupAuthListener()`
// because they are essential for immediate auth state synchronization.
