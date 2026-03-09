/* ===== SUPABASE CONFIG ===== */
const SUPABASE_URL = 'https://rmiqelafirlfbfvtitzg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-xUNjHyH5-ylRb8fynOYjg_ypbF758E';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ===== DATABASE HELPER FUNCTIONS ===== */

const DB = {
    // ---- CAMPS ----
    async getCamps() {
        const { data, error } = await supabaseClient
            .from('camps')
            .select('*')
            .order('id');
        if (error) {
            console.warn('Supabase getCamps error, falling back to localStorage:', error.message);
            return JSON.parse(localStorage.getItem('cdrs_camps') || '[]');
        }
        // Convert snake_case from DB to camelCase used in app
        const camps = data.map(c => ({
            id: c.id,
            name: c.name,
            code: c.code,
            location: c.location,
            totalCapacity: c.total_capacity,
            bedsAvailable: c.beds_available,
            foodAvailability: c.food_availability,
            children: c.children,
            adults: c.adults,
            seniors: c.seniors,
            foodStock: c.food_stock,
            medicineStock: c.medicine_stock
        }));
        // Sync to localStorage as cache
        localStorage.setItem('cdrs_camps', JSON.stringify(camps));
        return camps;
    },

    async updateCamp(campId, campData) {
        const { error } = await supabaseClient
            .from('camps')
            .update({
                total_capacity: campData.totalCapacity,
                beds_available: campData.bedsAvailable,
                food_availability: campData.foodAvailability,
                children: campData.children,
                adults: campData.adults,
                seniors: campData.seniors,
                food_stock: campData.foodStock,
                medicine_stock: campData.medicineStock
            })
            .eq('id', campId);
        if (error) console.warn('Supabase updateCamp error:', error.message);
    },

    // ---- USER REQUESTS ----
    async getRequests() {
        const { data, error } = await supabaseClient
            .from('user_requests')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.warn('Supabase getRequests error, falling back to localStorage:', error.message);
            return JSON.parse(localStorage.getItem('cdrs_requests') || '[]');
        }
        const requests = data.map(r => ({
            id: r.id,
            name: r.name,
            location: r.location,
            resource: r.resource,
            description: r.description,
            status: r.status,
            acceptedBy: r.accepted_by,
            timestamp: r.created_at
        }));
        localStorage.setItem('cdrs_requests', JSON.stringify(requests));
        return requests;
    },

    async addRequest(request) {
        const { error } = await supabaseClient
            .from('user_requests')
            .insert({
                id: request.id,
                name: request.name,
                location: request.location,
                resource: request.resource,
                description: request.description,
                status: request.status,
                accepted_by: request.acceptedBy
            });
        if (error) console.warn('Supabase addRequest error:', error.message);
        // Also save to localStorage
        const requests = JSON.parse(localStorage.getItem('cdrs_requests') || '[]');
        requests.push(request);
        localStorage.setItem('cdrs_requests', JSON.stringify(requests));
    },

    async updateRequestStatus(requestId, status, acceptedBy) {
        const { error } = await supabaseClient
            .from('user_requests')
            .update({ status: status, accepted_by: acceptedBy || null })
            .eq('id', requestId);
        if (error) console.warn('Supabase updateRequestStatus error:', error.message);
    },

    // ---- COORDINATORS ----
    async getCoordinators() {
        const { data, error } = await supabaseClient
            .from('coordinators')
            .select('*');
        if (error) {
            console.warn('Supabase getCoordinators error, falling back to localStorage:', error.message);
            return JSON.parse(localStorage.getItem('cdrs_coordinators') || '[]');
        }
        const coords = data.map(c => ({
            id: c.id,
            name: c.name,
            campCode: c.camp_code,
            email: c.email,
            phone: c.phone,
            password: c.password
        }));
        localStorage.setItem('cdrs_coordinators', JSON.stringify(coords));
        return coords;
    },

    async addCoordinator(coord) {
        const { error } = await supabaseClient
            .from('coordinators')
            .insert({
                id: coord.id,
                name: coord.name,
                camp_code: coord.campCode,
                email: coord.email,
                phone: coord.phone,
                password: coord.password
            });
        if (error) console.warn('Supabase addCoordinator error:', error.message);
        // Also save to localStorage
        const coordinators = JSON.parse(localStorage.getItem('cdrs_coordinators') || '[]');
        coordinators.push(coord);
        localStorage.setItem('cdrs_coordinators', JSON.stringify(coordinators));
    },

    // ---- RESOURCE REQUESTS ----
    async getResourceRequests() {
        const { data, error } = await supabaseClient
            .from('resource_requests')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.warn('Supabase getResourceRequests error, falling back to localStorage:', error.message);
            return JSON.parse(localStorage.getItem('cdrs_resource_requests') || '[]');
        }
        const resources = data.map(r => ({
            id: r.id,
            coordinatorName: r.coordinator_name,
            resourceType: r.resource_type,
            quantity: r.quantity,
            requiredBefore: r.required_before,
            description: r.description,
            timestamp: r.created_at
        }));
        localStorage.setItem('cdrs_resource_requests', JSON.stringify(resources));
        return resources;
    },

    async addResourceRequest(resource) {
        const { error } = await supabaseClient
            .from('resource_requests')
            .insert({
                id: resource.id,
                coordinator_name: resource.coordinatorName,
                resource_type: resource.resourceType,
                quantity: resource.quantity,
                required_before: resource.requiredBefore,
                description: resource.description
            });
        if (error) console.warn('Supabase addResourceRequest error:', error.message);
        const resources = JSON.parse(localStorage.getItem('cdrs_resource_requests') || '[]');
        resources.push(resource);
        localStorage.setItem('cdrs_resource_requests', JSON.stringify(resources));
    },

    // ---- MAP DATA ----
    async getMapGrid() {
        const { data, error } = await supabaseClient
            .from('map_data')
            .select('grid')
            .eq('id', 'main_grid')
            .single();
        if (error || !data) {
            console.warn('Supabase getMapGrid error, falling back to localStorage:', error?.message);
            const local = localStorage.getItem('cdrs_map_data');
            if (local) return JSON.parse(local);
            return Array.from({ length: 15 }, () => Array(15).fill('safe'));
        }
        localStorage.setItem('cdrs_map_data', JSON.stringify(data.grid));
        return data.grid;
    },

    async saveMapGrid(grid) {
        const { error } = await supabaseClient
            .from('map_data')
            .update({ grid: grid, updated_at: new Date().toISOString() })
            .eq('id', 'main_grid');
        if (error) console.warn('Supabase saveMapGrid error:', error.message);
        localStorage.setItem('cdrs_map_data', JSON.stringify(grid));
    }
};
