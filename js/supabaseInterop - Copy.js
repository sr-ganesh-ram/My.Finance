// This function will be called by Blazor to get a reference back to the C# service.
let supabaseServiceInstance = null;

// Helper to check if Supabase client is initialized
function checkSupabaseClient() {
    if (!window.supabaseJSClient) {
        console.error("Supabase JS client is not initialized. Please check wwwroot/index.html.");
        if (supabaseServiceInstance) {
            supabaseServiceInstance.invokeMethodAsync('HandleJsError', 'Supabase JS client not initialized.');
        }
        return false;
    }
    return true;
}

// Sets the .NET object reference for callbacks from JS to C#
window.supabaseInterop = {
    setServiceReference: function (dotNetObjRef) {
        supabaseServiceInstance = dotNetObjRef;
        console.log("JS: SupabaseService .NET reference set in JS interop.");
        this.getInitialSession();
        this.setupAuthListener();
    },

    // --- Authentication Operations ---

    signInWithGoogleRedirect: function (redirectToUrl) {
        if (!checkSupabaseClient()) return;

        console.log("JS: Calling signInWithOAuth with redirectTo:", redirectToUrl);
        window.supabaseJSClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectToUrl,
                queryParams: {
                    access_type: 'offline', // Request refresh token
                    prompt: 'consent',     // Prompt for consent every time
                }
            },
        })
            .then(({ data, error }) => {
                if (error) {
                    console.error('JS: Supabase OAuth Error:', error.message);
                    if (supabaseServiceInstance) {
                        supabaseServiceInstance.invokeMethodAsync('HandleJsError', error.message);
                    }
                } else if (data.url) {
                    console.log("JS: Redirecting to OAuth URL:", data.url);
                    window.location.href = data.url;
                }
            })
            .catch(e => {
                console.error('JS: Supabase OAuth Catch Error:', e);
                if (supabaseServiceInstance) {
                    supabaseServiceInstance.invokeMethodAsync('HandleJsError', e.message);
                }
            });
    },

    signOut: function () {
        if (!checkSupabaseClient()) return;

        console.log("JS: Calling signOut.");
        window.supabaseJSClient.auth.signOut()
            .then(({ error }) => {
                if (error) {
                    console.error('JS: Sign Out Error:', error.message);
                    if (supabaseServiceInstance) {
                        supabaseServiceInstance.invokeMethodAsync('HandleJsError', error.message);
                    }
                } else {
                    console.log('JS: Signed out successfully.');
                }
            })
            .catch(e => {
                console.error('JS: Sign Out Catch Error:', e);
                if (supabaseServiceInstance) {
                    supabaseServiceInstance.invokeMethodAsync('HandleJsError', e.message);
                }
            });
    },

    getInitialSession: function () {
        if (!checkSupabaseClient()) return;

        console.log("JS: Getting initial session.");
        window.supabaseJSClient.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error('JS: Get Session Error:', error.message);
                if (supabaseServiceInstance) {
                    supabaseServiceInstance.invokeMethodAsync('HandleJsError', error.message);
                }
            } else {
                this.notifyBlazorAuthChange(session);
            }
        }).catch(e => {
            console.error('JS: Get Session Catch Error:', e);
            if (supabaseServiceInstance) {
                supabaseServiceInstance.invokeMethodAsync('HandleJsError', e.message);
            }
        });
    },

    setupAuthListener: function () {
        if (!checkSupabaseClient()) return;

        console.log("JS: Setting up auth state change listener.");
        window.supabaseJSClient.auth.onAuthStateChange((event, session) => {
            console.log("JS: Auth state changed event:", event, "session:", session);
            this.notifyBlazorAuthChange(session);
        });
    },

    notifyBlazorAuthChange: function (session) {
        if (supabaseServiceInstance) {
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
            supabaseServiceInstance.invokeMethodAsync('OnJsAuthStateChanged', serializableSession);
        } else {
            console.warn("JS: Blazor service instance not set for callback. Auth state change not notified.");
        }
    },

    getLocalStorageToken: function (projectRef) {
        const supabaseAuthKey = `sb-${projectRef}-auth-token`;
        return localStorage.getItem(supabaseAuthKey);
    },

    // --- Database (CRUD) Operations ---

    fetchTasks: async function (skip, take) {
        if (!checkSupabaseClient()) return { data: [], count: 0, error: { message: "Supabase JS client not initialized." } };

        try {
            const from = skip;
            const to = skip + take - 1;

            const { data, error, count } = await window.supabaseJSClient
                .from('Tasks')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) {
                console.error('JS: Error fetching tasks:', error.message);
                return { data: [], count: 0, error: { message: error.message } };
            } else {
                console.log('JS: Fetched tasks RAW DATA:', data); // Log raw data
                return { data: data, count: count || 0, error: null };
            }
        } catch (e) {
            console.error('JS: Unexpected error fetching tasks:', e.message);
            return { data: [], count: 0, error: { message: `Unexpected error: ${e.message}` } };
        }
    },

    insertTask: async function (task) {
        if (!checkSupabaseClient()) return { success: false, errorMessage: "Supabase JS client not initialized." };

        try {
            const taskToInsert = {
                created_at: task.created_at,
                Name: task.Name,
                Description: task.Description,
                DueDate: task.DueDate,
                Status: task.Status,
                Stage: task.Stage,
                AssignedTo: task.AssignedTo
            };

            const { data, error } = await window.supabaseJSClient
                .from('Tasks')
                .insert([taskToInsert])
                .select();

            if (error) {
                console.error('JS: Error inserting task:', error.message);
                return { success: false, errorMessage: error.message };
            } else {
                console.log('JS: Inserted task RAW DATA:', data); // Log raw data
                return { success: true, errorMessage: null };
            }
        } catch (e) {
            console.error('JS: Unexpected error inserting task:', e.message);
            return { success: false, errorMessage: `Unexpected error: ${e.message}` };
        }
    },

    updateTask: async function (task) {
        if (!checkSupabaseClient()) return { success: false, errorMessage: "Supabase JS client not initialized." };

        try {
            const { data, error } = await window.supabaseJSClient
                .from('Tasks')
                .update(task)
                .eq('id', task.id)
                .select();

            if (error) {
                console.error('JS: Error updating task:', error.message);
                return { success: false, errorMessage: error.message };
            } else {
                console.log('JS: Updated task RAW DATA:', data); // Log raw data
                return { success: true, errorMessage: null };
            }
        } catch (e) {
            console.error('JS: Unexpected error updating task:', e.message);
            return { success: false, errorMessage: `Unexpected error: ${e.message}` };
        }
    },

    deleteTask: async function (id) {
        if (!checkSupabaseClient()) return { success: false, errorMessage: "Supabase JS client not initialized." };

        try {
            const { error } = await window.supabaseJSClient
                .from('Tasks')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('JS: Error deleting task:', error.message);
                return { success: false, errorMessage: error.message };
            } else {
                console.log('JS: Deleted task with ID:', id);
                return { success: true, errorMessage: null };
            }
        } catch (e) {
            console.error('JS: Unexpected error deleting task:', e.message);
            return { success: false, errorMessage: `Unexpected error: ${e.message}` };
        }
    },


    /**
    * Inserts a new record into a specified Supabase table.
    * @param {string} tableName - The name of the Supabase table to insert into.
    * @param {object} entity - The JavaScript object representing the data to insert.
    * @returns {Promise<{success: boolean, errorMessage: string|null}>} - An object indicating success or failure with an error message.
    */
    insert: async function (tableName, entity) {
        // Ensure the Supabase client is initialized
        if (!checkSupabaseClient()) {
            return { success: false, errorMessage: "Supabase JS client not initialized." };
        }

        try {
            // Log the attempt to insert, indicating the table and the entity
            console.log(`JS: Attempting to insert into table '${tableName}' with entity:`, entity);
            // Perform the insert operation using the provided table name and entity object
            const { data, error } = await window.supabaseJSClient
                .from(tableName) // Dynamically use the table name passed as an argument
                .insert([entity]) // Insert the generic entity object directly
                .select(); // Select the inserted data back

            if (error) {
                // Log and return the error message if the Supabase operation fails
                console.error(`JS: Error inserting into '${tableName}':`, error.message);
                return { success: false, errorMessage: error.message };
            } else {
                // Log the successful insertion and return success
                console.log(`JS: Successfully inserted into '${tableName}'. Raw data:`, data);
                return { success: true, errorMessage: null };
            }
        } catch (e) {
            // Catch any unexpected JavaScript errors during the process
            console.error(`JS: Unexpected error inserting into '${tableName}':`, e.message);
            return { success: false, errorMessage: `Unexpected error: ${e.message}` };
        }
    },

    /**
     * Searches for a record in a specified Supabase table by its ID.
     * @param {string} tableName - The name of the Supabase table to search in.
     * @param {string} id - The ID of the record to search for.
     * @returns {Promise<{data: object|null, error: {message: string}|null}>} - An object containing the fetched data or an error.
     */
    searchById: async function (tableName, id) {
        if (!checkSupabaseClient()) return { data: null, error: { message: "Supabase JS client not initialized." } };

        try {
            console.log(`JS: Searching for record in '${tableName}' by ID: ${id}`);
            const { data, error } = await window.supabaseJSClient
                .from(tableName)
                .select('*')
                .eq('id', id)
                .single(); // Use .single() to expect at most one record

            if (error) {
                console.error(`JS: Error searching by ID in '${tableName}':`, error.message);
                return { data: null, error: { message: error.message } };
            } else {
                console.log(`JS: Found record by ID in '${tableName}':`, data);
                return { data: data, error: null };
            }
        } catch (e) {
            console.error(`JS: Unexpected error searching by ID in '${tableName}':`, e.message);
            return { data: null, error: { message: `Unexpected error: ${e.message}` } };
        }
    },

    /**
     * Searches for records in a specified Supabase table by a name field.
     * This assumes a 'Name' column in your table. You might need to adjust the column name.
     * @param {string} tableName - The name of the Supabase table to search in.
     * @param {string} name - The name to search for.
     * @returns {Promise<{data: Array<object>, error: {message: string}|null}>} - An object containing the fetched data or an error.
     */
    searchByName: async function (tableName, name) {
        if (!checkSupabaseClient()) return { data: [], error: { message: "Supabase JS client not initialized." } };

        try {
            console.log(`JS: Searching for records in '${tableName}' by Name: ${name}`);
            // Using .ilike for case-insensitive partial matching. Adjust if exact match is needed.
            const { data, error } = await window.supabaseJSClient
                .from(tableName)
                .select('*')
                .ilike('name', `%${name}%`); // Assuming a 'Name' column; adjust if different
            //name is case sensitive use it carefully.
            console.log(`JS: Searching for records in '${tableName}' by Field Name: ${name}`);

            if (error) {
                console.error(`JS: Error searching by Name in '${tableName}':`, error.message);
                return { data: [], error: { message: error.message } };
            } else {
                console.log(`JS: Found records by Name in '${tableName}':`, data);
                return { data: data, error: null };
            }
        } catch (e) {
            console.error(`JS: Unexpected error searching by Name in '${tableName}':`, e.message);
            return { data: [], error: { message: `Unexpected error: ${e.message}` } };
        }
    },

    /**
     * Searches for tasks by name, with pagination, returning a maximum of 5 results per page.
     * @param {string} taskName - The name (or partial name) of the task to search for.
     * @param {number} skip - The number of records to skip (for pagination).
     * @param {number} take - The number of records to take (page size). This method enforces a max of 5.
     * @returns {Promise<{data: Array<object>, count: number, error: {message: string}|null}>} - An object containing the fetched tasks, total count, or an error.
     */
    searchTasksByNameWithPagination: async function (taskName, skip, take) {
        if (!checkSupabaseClient()) return { data: [], count: 0, error: { message: "Supabase JS client not initialized." } };

        try {
            const limit = 5; // Enforce a maximum of 5 results as requested
            const actualTake = Math.min(take, limit); // Ensure 'take' does not exceed the limit
            const from = skip;
            const to = skip + actualTake - 1;

            console.log(`JS: Searching for tasks by name '${taskName}' with skip: ${skip}, take: ${actualTake}`);

            const { data, error, count } = await window.supabaseJSClient
                .from('Tasks') // Assuming 'Tasks' is the table name
                .select('*', { count: 'exact' }) // Get count of all matching records
                .ilike('Name', `%${taskName}%`) // Case-insensitive partial match on 'Name'
                .order('created_at', { ascending: false }) // Order results (e.g., by creation date)
                .range(from, to); // Apply pagination

            if (error) {
                console.error('JS: Error searching tasks by name with pagination:', error.message);
                return { data: [], count: 0, error: { message: error.message } };
            } else {
                console.log('JS: Searched tasks by name RAW DATA:', data);
                return { data: data, count: count || 0, error: null };
            }
        } catch (e) {
            console.error('JS: Unexpected error searching tasks by name with pagination:', e.message);
            return { data: [], count: 0, error: { message: `Unexpected error: ${e.message}` } };
        }
    },

    /**
     * Updates an existing record in a specified Supabase table by its 'id'.
     * @param {string} tableName - The name of the Supabase table to update.
     * @param {any} id - The ID of the record to update.
     * @param {object} updates - An object containing the fields and their new values to update.
     * @returns {Promise<{success: boolean, errorMessage: string|null}>} - An object indicating success or failure with an error message.
     */
    update: async function (tableName, id, updates) {
        if (!checkSupabaseClient()) {
            return { success: false, errorMessage: "Supabase JS client not initialized." };
        }

        try {
            console.log(`JS: Attempting to update record in table '${tableName}' with ID '${id}' with updates:`, updates);
            const { data, error } = await window.supabaseJSClient
                .from(tableName)
                .update(updates)
                .eq('id', id)
                .select(); // Select the updated data back

            if (error) {
                console.error(`JS: Error updating record in '${tableName}':`, error.message);
                return { success: false, errorMessage: error.message };
            } else {
                console.log(`JS: Successfully updated record in '${tableName}'. Raw data:`, data);
                return { success: true, errorMessage: null };
            }
        } catch (e) {
            console.error(`JS: Unexpected error updating record in '${tableName}':`, e.message);
            return { success: false, errorMessage: `Unexpected error: ${e.message}` };
        }
    },

    /**
     * Deletes a record from a specified Supabase table by its 'id'.
     * @param {string} tableName - The name of the Supabase table to delete from.
     * @param {any} id - The ID of the record to delete.
     * @returns {Promise<{success: boolean, errorMessage: string|null}>} - An object indicating success or failure with an error message.
     */
    delete: async function (tableName, id) {
        if (!checkSupabaseClient()) {
            return { success: false, errorMessage: "Supabase JS client not initialized." };
        }

        try {
            console.log(`JS: Attempting to delete record from table '${tableName}' with ID: ${id}`);
            const { error } = await window.supabaseJSClient
                .from(tableName)
                .delete()
                .eq('id', id);

            if (error) {
                console.error(`JS: Error deleting record from '${tableName}':`, error.message);
                return { success: false, errorMessage: error.message };
            } else {
                console.log(`JS: Successfully deleted record from '${tableName}' with ID: ${id}`);
                return { success: true, errorMessage: null };
            }
        } catch (e) {
            console.error(`JS: Unexpected error deleting record from '${tableName}':`, e.message);
            return { success: false, errorMessage: `Unexpected error: ${e.message}` };
        }
    },
};