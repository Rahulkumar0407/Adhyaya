/**
 * Pagination utility to handle common limit/page logic
 */
export const getPaginationData = (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

export const getPaginatedResponse = (data, total, page, limit) => {
    return {
        count: data.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasNext: total > page * limit,
        hasPrev: page > 1,
        data
    };
};
