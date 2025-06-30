// supabaseTasks.js
// This file contains specific CRUD and search operations related to the 'Tasks' table.

// Import necessary core function from supabaseBase.js
import { checkSupabaseClient } from './supabase.Base.js';

/**
 * Fetches tasks with pagination.
 * @param {number} skip - The number of records to skip.
 * @param {number} take - The number of records to take (page size).
 * @returns {Promise<{data: Array<object>, count: number, error: {message: string}|null}>} - An object containing the fetched tasks, total count, or an error.
 */
async function fetchTasks(skip, take) {
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
            console.log('JS: Fetched tasks RAW DATA:', data);
            return { data: data, count: count || 0, error: null };
        }
    } catch (e) {
        console.error('JS: Unexpected error fetching tasks:', e.message);
        return { data: [], count: 0, error: { message: `Unexpected error: ${e.message}` } };
    }
}

/**
 * Inserts a new task into the 'Tasks' table.
 * @param {object} task - The task object to insert.
 * @returns {Promise<{success: boolean, errorMessage: string|null}>} - An object indicating success or failure.
 */
async function insertTask(task) {
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
            console.log('JS: Inserted task RAW DATA:', data);
            return { success: true, errorMessage: null };
        }
    } catch (e) {
        console.error('JS: Unexpected error inserting task:', e.message);
        return { success: false, errorMessage: `Unexpected error: ${e.message}` };
    }
}

/**
 * Updates an existing task in the 'Tasks' table.
 * @param {object} task - The task object with updated fields, including its 'id'.
 * @returns {Promise<{success: boolean, errorMessage: string|null}>} - An object indicating success or failure.
 */
async function updateTask(task) {
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
            console.log('JS: Updated task RAW DATA:', data);
            return { success: true, errorMessage: null };
        }
    } catch (e) {
        console.error('JS: Unexpected error updating task:', e.message);
        return { success: false, errorMessage: `Unexpected error: ${e.message}` };
    }
}

/**
 * Deletes a task from the 'Tasks' table by its ID.
 * @param {any} id - The ID of the task to delete.
 * @returns {Promise<{success: boolean, errorMessage: string|null}>} - An object indicating success or failure.
 */
async function deleteTask(id) {
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
}

/**
 * Searches for tasks by name, with pagination, returning a maximum of 5 results per page.
 * @param {string} taskName - The name (or partial name) of the task to search for.
 * @param {number} skip - The number of records to skip (for pagination).
 * @param {number} take - The number of records to take (page size). This method enforces a max of 5.
 * @returns {Promise<{data: Array<object>, count: number, error: {message: string}|null}>} - An object containing the fetched tasks, total count, or an error.
 */
async function searchTasksByNameWithPagination(taskName, skip, take) {
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
}

// Export all task-specific functions
export {
    fetchTasks,
    insertTask,
    updateTask,
    deleteTask,
    searchTasksByNameWithPagination
};
