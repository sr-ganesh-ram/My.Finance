// supabaseGenericCrud.js
// This file provides generic CRUD (Create, Read, Update, Delete) and search operations
// that can be applied to any Supabase table, given the table name and data.

// Import necessary core function from supabaseBase.js
import { checkSupabaseClient } from './supabase.Base.js';

/**
 * Inserts a new record into a specified Supabase table.
 * @param {string} tableName - The name of the Supabase table to insert into.
 * @param {object} entity - The JavaScript object representing the data to insert.
 * @returns {Promise<{success: boolean, errorMessage: string|null}>} - An object indicating success or failure with an error message.
 */
async function insert(tableName, entity) {
    if (!checkSupabaseClient()) {
        return { success: false, errorMessage: "Supabase JS client not initialized." };
    }

    try {
        console.log(`JS: Attempting to insert into table '${tableName}' with entity:`, entity);
        const { data, error } = await window.supabaseJSClient
            .from(tableName)
            .insert([entity]) // Insert the generic entity object directly
            .select(); // Select the inserted data back

        if (error) {
            console.error(`JS: Error inserting into '${tableName}':`, error.message);
            return { success: false, errorMessage: error.message };
        } else {
            console.log(`JS: Successfully inserted into '${tableName}'. Raw data:`, data);
            return { success: true, errorMessage: null };
        }
    } catch (e) {
        console.error(`JS: Unexpected error inserting into '${tableName}':`, e.message);
        return { success: false, errorMessage: `Unexpected error: ${e.message}` };
    }
}

/**
 * Updates an existing record in a specified Supabase table by its 'id'.
 * @param {string} tableName - The name of the Supabase table to update.
 * @param {any} id - The ID of the record to update.
 * @param {object} updates - An object containing the fields and their new values to update.
 * @returns {Promise<{success: boolean, errorMessage: string|null}>} - An object indicating success or failure with an error message.
 */
async function update(tableName, id, updates) {
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
}

/**
 * Deletes a record from a specified Supabase table by its 'id'.
 * @param {string} tableName - The name of the Supabase table to delete from.
 * @param {any} id - The ID of the record to delete.
 * @returns {Promise<{success: boolean, errorMessage: string|null}>} - An object indicating success or failure with an error message.
 */
async function deleteById(tableName, id) { // Renamed from 'delete' to 'deleteById' to avoid reserved keyword
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
}


/**
 * Searches for a record in a specified Supabase table by its ID.
 * @param {string} tableName - The name of the Supabase table to search in.
 * @param {string} id - The ID of the record to search for.
 * @returns {Promise<{data: object|null, error: {message: string}|null}>} - An object containing the fetched data or an error.
 */
async function searchById(tableName, id) {
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
}

/**
 * Searches for records in a specified Supabase table by a name field.
 * This assumes a 'Name' column in your table. You might need to adjust the column name.
 * @param {string} tableName - The name of the Supabase table to search in.
 * @param {string} name - The name to search for.
 * @returns {Promise<{data: Array<object>, error: {message: string}|null}>} - An object containing the fetched data or an error.
 */
async function searchByName(tableName, name) {
    if (!checkSupabaseClient()) return { data: [], error: { message: "Supabase JS client not initialized." } };

    try {
        console.log(`JS: Searching for records in '${tableName}' by Name: ${name}`);
        // Using .ilike for case-insensitive partial matching. Adjust if exact match is needed.
        const { data, error } = await window.supabaseJSClient
            .from(tableName)
            .select('*')
            .ilike('Name', `%${name}%`); // Assuming a 'Name' column; adjust if different

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
}

// Export all generic CRUD and search functions
export {
    insert,
    update,
    deleteById, // Exported as deleteById
    searchById,
    searchByName
};
